// backend/cmd/seed/main.go
//
// Uso:
//   go run ./cmd/seed/main.go --content /ruta/a/src/content/blog
//	 go run main.go --content ./content/blog (dentro del cmd/seed)
// Variables de entorno necesarias (mismas que el servidor):
//   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
//   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, S3_ENDPOINT

package main

import (
	"bytes"
	"context"
	"flag"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/nfnt/resize"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/veniversvm/ClickAlternativo2/backend/internal/models"
)

//  Helpers

var nonAlpha = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(s string) string {
	replacer := strings.NewReplacer(
		"á", "a", "é", "e", "í", "i", "ó", "o", "ú", "u",
		"ñ", "n", "ü", "u",
	)
	s = replacer.Replace(strings.ToLower(s))
	return strings.Trim(nonAlpha.ReplaceAllString(s, "-"), "-")
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

//  Parseo de frontmatter

type Frontmatter struct {
	Title       string
	Description string
	Tags        []string
	ExternalURL string
}

func parseFrontmatter(content string) Frontmatter {
	fm := Frontmatter{}

	// start := strings.Index(content, "---")
	// if start == -1 {
	// 	return fm
	// }
	// end := strings.Index(content[start+3:], "---")
	// if end == -1 {
	// 	return fm
	// }

	parts := strings.Split(content, "---")
	if len(parts) < 3 {
		return fm
	}

	// block := content[start+3 : start+3+end]
	block := parts[1]
	for _, line := range strings.Split(block, "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		if strings.HasPrefix(line, "title:") {
			fm.Title = strings.TrimSpace(strings.TrimPrefix(line, "title:"))
			fm.Title = strings.Trim(fm.Title, "'\"")
		}

		if strings.HasPrefix(line, "description:") {
			fm.Description = strings.TrimSpace(strings.TrimPrefix(line, "description:"))
			fm.Description = strings.Trim(fm.Description, "'\"")
		}

		if strings.HasPrefix(line, "externalUrl:") {
			fm.ExternalURL = strings.TrimSpace(strings.TrimPrefix(line, "externalUrl:"))
			fm.ExternalURL = strings.Trim(fm.ExternalURL, "'\"")
		}

		if strings.HasPrefix(line, "tags:") {
			raw := strings.TrimSpace(strings.TrimPrefix(line, "tags:"))
			raw = strings.Trim(raw, "[]")
			for _, t := range strings.Split(raw, ",") {
				t = strings.TrimSpace(t)
				t = strings.Trim(t, "\"'")
				if t != "" {
					fm.Tags = append(fm.Tags, strings.ToLower(t))
				}
			}
		}
	}

	return fm
}

func extractBody(content string) string {
	parts := strings.Split(content, "---")
	if len(parts) < 3 {
		return ""
	}
	// Parts[2] es todo lo que sigue al frontmatter
	return strings.TrimSpace(parts[2])
}

//  S3

type S3Client struct {
	client   *s3.Client
	bucket   string
	endpoint string
}

func newS3Client() (*S3Client, error) {
	region := getEnv("AWS_REGION", "us-east-1")
	accessKey := mustEnv("AWS_ACCESS_KEY_ID")
	secretKey := mustEnv("AWS_SECRET_ACCESS_KEY")
	bucket := mustEnv("AWS_BUCKET_NAME")
	endpoint := getEnv("S3_ENDPOINT", "http://localhost:9000")

	cfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithRegion(region),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
		),
	)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})

	return &S3Client{client: client, bucket: bucket, endpoint: endpoint}, nil
}

func (s *S3Client) upload(filePath string) (string, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer f.Close()

	buf := make([]byte, 512)
	n, _ := f.Read(buf)
	contentType := http.DetectContentType(buf[:n])
	f.Seek(0, io.SeekStart)

	info, err := os.Stat(filePath)
	if err != nil {
		return "", err
	}

	img, format, err := image.Decode(f)
	if err != nil {
		f.Seek(0, io.SeekStart)
		return s.uploadRaw(f, filePath, contentType)
	}

	if info.Size() > 1*1024*1024 {
		img = resize.Thumbnail(1920, 1080, img, resize.Lanczos3)
	}

	var out bytes.Buffer
	if format == "png" {
		png.Encode(&out, img)
		contentType = "image/png"
	} else {
		quality := 85
		if info.Size() > 1*1024*1024 {
			quality = 70
		}
		jpeg.Encode(&out, img, &jpeg.Options{Quality: quality})
		contentType = "image/jpeg"
	}

	return s.uploadRaw(&out, filePath, contentType)
}

func (s *S3Client) uploadRaw(r io.Reader, originalName string, contentType string) (string, error) {
	ext := filepath.Ext(originalName)
	key := fmt.Sprintf("entries/%s%s", uuid.New().String(), ext)

	// Leemos todo el contenido a un buffer para que sea "seekable"
	// Esto resuelve el error de "unseekable stream"
	data, err := io.ReadAll(r)
	if err != nil {
		return "", err
	}

	_, err = s.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data), // Usamos un Reader de bytes (es seekable)
		ContentType: aws.String(contentType),
		// Desactivamos explícitamente el checksum automático que da problemas en HTTP
	})
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%s/%s/%s", s.endpoint, s.bucket, key), nil
}

//  Tags primarios del menú

var primaryTags = map[string]bool{
	"paginas":  true,
	"noticias": true,
	"software": true,
	"gaming":   true,
	"cine":     true,
	"musica":   true,
	"lectura":  true,
}

//  Main

func main() {
	contentDir := flag.String("content", "", "Ruta a src/content/blog")
	dryRun := flag.Bool("dry", false, "Solo parsea, no inserta en DB ni S3")
	flag.Parse()

	if *contentDir == "" {
		log.Fatal("Uso: go run ./cmd/seed/main.go --content /ruta/a/src/content/blog")
	}

	godotenv.Load()

	var db *gorm.DB
	var s3c *S3Client

	if !*dryRun {
		var err error
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
			getEnv("DB_HOST", "localhost"),
			mustEnv("DB_USER"),
			mustEnv("DB_PASSWORD"),
			mustEnv("DB_NAME"),
			getEnv("DB_PORT", "5432"),
		)

		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Warn),
		})
		if err != nil {
			log.Fatalf("Error conectando a DB: %v", err)
		}

		s3c, err = newS3Client()
		if err != nil {
			log.Fatalf("Error conectando a S3: %v", err)
		}

		log.Println("✅ Conectado a DB y S3")

		//  Crear SuperAdmin por defecto
		var existingAdmin models.Admin
		if db.Where("email = ?", "admin@clickalternativo.com").First(&existingAdmin).Error != nil {
			hash, err := hashPassword("admin1234")
			if err != nil {
				log.Printf("❌ Error hasheando password del admin: %v", err)
			} else {
				superAdmin := models.Admin{
					Email:        "admin@clickalternativo.com",
					PasswordHash: hash,
					IsSuperAdmin: true,
				}
				if err := db.Create(&superAdmin).Error; err != nil {
					log.Printf("❌ Error creando superadmin: %v", err)
				} else {
					log.Println("👑 SuperAdmin creado: admin@clickalternativo.com / admin1234")
				}
			}
		} else {
			log.Println("⏭️  SuperAdmin ya existe, saltando")
		}

	} else {
		log.Println("🔍 Modo dry-run: solo parseo, sin escrituras")
	}

	// Recorrer carpetas de contenido
	entries, err := os.ReadDir(*contentDir)
	if err != nil {
		log.Fatalf("No se pudo leer el directorio: %v", err)
	}

	categoryCache := map[string]*models.Category{}
	successCount := 0
	skipCount := 0

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		folderPath := filepath.Join(*contentDir, entry.Name())

		mdxFile := findMDX(folderPath)
		if mdxFile == "" {
			log.Printf("⚠️  Sin .mdx en %s, saltando", entry.Name())
			skipCount++
			continue
		}

		raw, err := os.ReadFile(mdxFile)
		if err != nil {
			log.Printf("❌ No se pudo leer %s: %v", mdxFile, err)
			skipCount++
			continue
		}

		rawStr := string(raw)
		fm := parseFrontmatter(rawStr)
		contentBody := extractBody(rawStr)

		if fm.Title == "" {
			log.Printf("⚠️  Sin título en %s, saltando", entry.Name())
			skipCount++
			continue
		}

		log.Printf("📄 Procesando: %s", fm.Title)

		if *dryRun {
			log.Printf("   Tags: %v | URL: %s", fm.Tags, fm.ExternalURL)
			successCount++
			continue
		}

		entrySlug := slugify(fm.Title)
		var existing models.Entry
		if db.Where("slug = ?", entrySlug).First(&existing).Error == nil {
			log.Printf("   ⏭️  Ya existe (slug: %s), saltando", entrySlug)
			skipCount++
			continue
		}

		//  Subir imágenes
		imageURLs := []string{}
		imageFiles := findImages(folderPath)

		for i, imgPath := range imageFiles {
			if i >= 3 {
				break
			}
			url, err := s3c.upload(imgPath)
			if err != nil {
				log.Printf("   ⚠️  Error subiendo imagen %s: %v", imgPath, err)
				continue
			}
			imageURLs = append(imageURLs, url)
			log.Printf("   🖼️  Imagen subida: %s", filepath.Base(imgPath))
		}

		// Resolver/crear categorías
		var categories []models.Category
		for _, tagName := range fm.Tags {
			tagSlug := slugify(tagName)

			if cat, ok := categoryCache[tagSlug]; ok {
				categories = append(categories, *cat)
				continue
			}

			var cat models.Category
			catType := models.TypeSecondary
			if primaryTags[tagSlug] {
				catType = models.TypePrimary
			}

			result := db.Where("slug = ?", tagSlug).First(&cat)
			if result.Error != nil {
				cat = models.Category{
					Name: tagName,
					Slug: tagSlug,
					Type: catType,
				}
				if err := db.Create(&cat).Error; err != nil {
					log.Printf("   ⚠️  Error creando categoría %s: %v", tagName, err)
					continue
				}
				log.Printf("   🏷️  Categoría creada: %s (%s)", tagName, catType)
			}

			categoryCache[tagSlug] = &cat
			categories = append(categories, cat)
		}

		// Crear entrada
		newEntry := models.Entry{
			Title:       fm.Title,
			Slug:        entrySlug,
			Description: fm.Description,
			ContentURL:  fm.ExternalURL,
			Content:     contentBody,
			Categories:  categories,
		}

		if len(imageURLs) > 0 {
			newEntry.ImageURL1 = imageURLs[0]
		}
		if len(imageURLs) > 1 {
			newEntry.ImageURL2 = imageURLs[1]
		}
		if len(imageURLs) > 2 {
			newEntry.ImageURL3 = imageURLs[2]
		}

		if err := db.Create(&newEntry).Error; err != nil {
			log.Printf("   ❌ Error creando entrada %s: %v", fm.Title, err)
			skipCount++
			continue
		}

		log.Printf("   ✅ Entrada creada: %s", fm.Title)
		successCount++
	}

	log.Printf("\n═══════════════════════════════════")
	log.Printf("✅ Exitosas: %d", successCount)
	log.Printf("⏭️  Saltadas:  %d", skipCount)
	log.Printf("═══════════════════════════════════")
}

// Helpers de archivos

func findMDX(dir string) string {
	files, _ := os.ReadDir(dir)
	for _, f := range files {
		if !f.IsDir() {
			name := f.Name()
			if strings.HasSuffix(name, ".mdx") || strings.HasSuffix(name, ".md") {
				return filepath.Join(dir, name)
			}
		}
	}
	return ""
}

var imageExts = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true,
	".webp": true, ".gif": true,
}

func findImages(dir string) []string {
	files, _ := os.ReadDir(dir)
	var images []string
	for _, f := range files {
		if !f.IsDir() {
			ext := strings.ToLower(filepath.Ext(f.Name()))
			if imageExts[ext] {
				images = append(images, filepath.Join(dir, f.Name()))
			}
		}
	}
	return images
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("Variable de entorno requerida: %s", key)
	}
	return v
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
