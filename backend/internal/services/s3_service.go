package services

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

type S3Service struct {
	client     *s3.Client
	bucketName string
	endpoint   string // interno , necesario para comunicacion de api a s3
	publicURL  string // Externo (NUEVO)
}

func NewS3Service(region, accessKey, secretKey, bucketName, endpoint, publicURL string) (*S3Service, error) {
	// Configuración específica para MinIO
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true // CRÍTICO: MinIO usa path-style
	})

	return &S3Service{
		client:     client,
		bucketName: bucketName,
		endpoint:   endpoint,
		publicURL:  publicURL,
	}, nil
}

// UploadImage sube una imagen y retorna la URL pública
func (s *S3Service) UploadImage(file io.Reader, fileName string, contentType string) (string, error) {
	ext := filepath.Ext(fileName)
	key := fmt.Sprintf("entries/%s%s", uuid.New().String(), ext)

	// --- SOLUCIÓN: Leer todo a memoria para que sea 'seekable' ---
	data, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("error leyendo buffer de imagen: %w", err)
	}

	_, err = s.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(s.bucketName),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data), // Ahora el SDK puede leerlo varias veces
		ContentType: aws.String(contentType),
	})

	if err != nil {
		return "", fmt.Errorf("error en PutObject: %w", err)
	}

	log.Printf("✅ Imagen subida con éxito: %s", key)
	return fmt.Sprintf("%s/%s/%s", s.publicURL, s.bucketName, key), nil
}

// DeleteImageByUrl extrae la llave de la URL y elimina el objeto de S3
func (s *S3Service) DeleteImageByUrl(fullURL string) error {
	if fullURL == "" {
		return nil
	}

	// Ejemplo URL: https://mi-bucket.s3.us-east-1.amazonaws.com/entries/uuid.jpg
	// La Key es: entries/uuid.jpg
	// Buscamos la parte después del dominio de amazonaws.com/
	parts := strings.Split(fullURL, ".com/")
	if len(parts) < 2 {
		return fmt.Errorf("URL de S3 inválida")
	}
	key := parts[1]

	_, err := s.client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	})

	if err != nil {
		return fmt.Errorf("error borrando objeto de S3: %w", err)
	}

	return nil
}
