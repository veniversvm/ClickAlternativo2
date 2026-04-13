package handlers

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/models"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/services"
	"github.com/veniversvm/ClickAlternativo2/backend/utils"
	"gorm.io/gorm"
)

type EntryHandler struct {
	DB *gorm.DB
	S3 *services.S3Service
}

func (h *EntryHandler) Create(c *fiber.Ctx) error {
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Error en el formulario"})
	}

	title := c.FormValue("title")
	entry := models.Entry{
		Title:       title,
		Slug:        utils.Slugify(title),
		Description: c.FormValue("description"),
		ContentURL:  c.FormValue("content_url"),
	}

	// Procesar hasta 3 imágenes: campos "image1", "image2", "image3"
	for i := 1; i <= 3; i++ {
		fieldName := fmt.Sprintf("image%d", i)
		files := form.File[fieldName]
		if len(files) > 0 {
			fileHeader := files[0]
			file, _ := fileHeader.Open()

			// --- LIMPIEZA Y COMPRESIÓN ---
			cleanReader, contentType, err := services.ProcessImage(file, fileHeader.Size)
			if err != nil {
				return c.Status(400).JSON(fiber.Map{"error": "Imagen " + fieldName + " inválida"})
			}

			url, err := h.S3.UploadImage(cleanReader, fileHeader.Filename, contentType)
			if err == nil {
				if i == 1 {
					entry.ImageURL1 = url
				}
				if i == 2 {
					entry.ImageURL2 = url
				}
				if i == 3 {
					entry.ImageURL3 = url
				}
			}
			file.Close()
		}
	}

	// Categorías... (mismo código de antes)

	if err := h.DB.Create(&entry).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al guardar"})
	}
	return c.Status(201).JSON(entry)
}

func (h *EntryHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	var entry models.Entry

	if err := h.DB.First(&entry, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Post no encontrado"})
	}

	// 1. Borrar de S3 (Deberías añadir un método DeleteObject en s3_service)
	urls := []string{entry.ImageURL1, entry.ImageURL2, entry.ImageURL3}
	for _, url := range urls {
		if url != "" {
			h.S3.DeleteImageByUrl(url)
		}
	}

	// 2. Borrar de DB
	h.DB.Select("Categories").Delete(&entry)
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *EntryHandler) GetPaginated(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	search := strings.TrimSpace(c.Query("search", ""))
	tagSlug := strings.TrimSpace(c.Query("tag", ""))

	limit := 20
	offset := (page - 1) * limit

	// 1. Iniciamos la consulta con DISTINCT para evitar filas duplicadas al hacer Joins
	// Seleccionamos solo los campos necesarios para el feed (Lean Response)
	query := h.DB.Model(&models.Entry{}).
		Select("DISTINCT entries.id, entries.title, entries.slug, entries.description, entries.image_url1, entries.created_at")

	// 2. Lógica de Búsqueda Expandida (Título, Descripción o Tag)
	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"

		// Usamos Joins para incluir los nombres de las categorías en la búsqueda
		query = query.Joins("LEFT JOIN entry_categories ec ON ec.entry_id = entries.id").
			Joins("LEFT JOIN categories c ON c.id = ec.category_id").
			Where("(LOWER(entries.title) LIKE ? OR LOWER(entries.description) LIKE ? OR LOWER(c.name) LIKE ?)",
				searchPattern, searchPattern, searchPattern)
	}

	// 3. Filtro estricto por Tag (Si se navega por una sección específica)
	if tagSlug != "" {
		// Reutilizamos el join si no se ha hecho en el search
		if search == "" {
			query = query.Joins("JOIN entry_categories ec_filter ON ec_filter.entry_id = entries.id").
				Joins("JOIN categories c_filter ON c_filter.id = ec_filter.category_id").
				Where("c_filter.slug = ?", tagSlug)
		} else {
			// Si ya hay búsqueda, simplemente añadimos la condición de slug al join existente
			query = query.Where("c.slug = ?", tagSlug)
		}
	}

	// 4. Ejecución con Orden y Paginación
	var entries []models.Entry
	err := query.
		Preload("Categories", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name", "slug", "type")
		}).
		Order("entries.created_at DESC"). // Siempre lo más nuevo primero
		Limit(limit).
		Offset(offset).
		Find(&entries).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al consultar la base de datos"})
	}

	return c.JSON(fiber.Map{
		"page":    page,
		"limit":   limit,
		"results": entries,
	})
}

// GetBySlug - Búsqueda detallada para la página de la entrada
func (h *EntryHandler) GetBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	var entry models.Entry

	// Buscamos por slug y precargamos las categorías (Preload)
	// Traemos todos los campos (* por defecto en GORM si no usamos Select)
	result := h.DB.Preload("Categories").Where("slug = ?", slug).First(&entry)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{"error": "La entrada no existe"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Error al consultar la entrada"})
	}

	return c.JSON(entry)
}

func (h *EntryHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var entry models.Entry

	// 1. Buscar la entrada existente con sus categorías
	if err := h.DB.Preload("Categories").First(&entry, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Entrada no encontrada"})
	}

	// 2. Actualizar campos de texto básicos
	title := c.FormValue("title")
	if title != "" && title != entry.Title {
		entry.Title = title
		entry.Slug = utils.Slugify(title) // Actualizamos slug por SEO
	}
	entry.Description = c.FormValue("description")
	entry.ContentURL = c.FormValue("content_url")

	// 3. Procesar Imágenes (image1, image2, image3)
	form, _ := c.MultipartForm()
	for i := 1; i <= 3; i++ {
		fieldName := fmt.Sprintf("image%d", i)
		files := form.File[fieldName]

		if len(files) > 0 {
			// Si el admin envía una nueva imagen para este slot:
			// A. Identificar la URL vieja para borrarla de S3
			var oldURL string
			if i == 1 {
				oldURL = entry.ImageURL1
			}
			if i == 2 {
				oldURL = entry.ImageURL2
			}
			if i == 3 {
				oldURL = entry.ImageURL3
			}

			if oldURL != "" {
				h.S3.DeleteImageByUrl(oldURL) // Limpieza de S3
			}

			// B. Procesar la nueva imagen (Limpieza y Compresión)
			fileHeader := files[0]
			file, _ := fileHeader.Open()
			cleanReader, contentType, err := services.ProcessImage(file, fileHeader.Size)
			if err != nil {
				file.Close()
				continue // O manejar error
			}

			// C. Subir nueva imagen
			newURL, err := h.S3.UploadImage(cleanReader, fileHeader.Filename, contentType)
			if err == nil {
				if i == 1 {
					entry.ImageURL1 = newURL
				}
				if i == 2 {
					entry.ImageURL2 = newURL
				}
				if i == 3 {
					entry.ImageURL3 = newURL
				}
			}
			file.Close()
		}
	}

	// 4. Actualizar Categorías (Relación M:N)
	categoryIDsRaw := c.FormValue("category_ids")
	if categoryIDsRaw != "" {
		var newCategories []models.Category
		ids := strings.Split(categoryIDsRaw, ",")
		h.DB.Where("id IN ?", ids).Find(&newCategories)

		// Replace sincroniza la tabla intermedia automáticamente
		h.DB.Model(&entry).Association("Categories").Replace(newCategories)
	}

	// 5. Guardar cambios en DB
	if err := h.DB.Save(&entry).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al actualizar la entrada"})
	}

	return c.JSON(entry)
}
