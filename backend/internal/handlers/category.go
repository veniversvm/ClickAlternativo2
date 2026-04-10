package handlers

import (
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/models"
	"gorm.io/gorm"
)

type CategoryHandler struct {
	DB *gorm.DB
}

// slugify es una función auxiliar para generar slugs de SEO
func slugify(s string) string {
	var re = regexp.MustCompile(`[^a-z0-9]+`)
	return strings.Trim(re.ReplaceAllString(strings.ToLower(s), "-"), "-")
}

// CreateCategory - Solo Admin
func (h *CategoryHandler) Create(c *fiber.Ctx) error {
	type Request struct {
		Name        string              `json:"name"`
		Type        models.CategoryType `json:"type"` // "primary" o "secondary"
		Description string              `json:"description"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	category := models.Category{
		Name:        req.Name,
		Slug:        slugify(req.Name),
		Type:        req.Type,
		Description: req.Description,
	}

	if err := h.DB.Create(&category).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al crear categoría (posible nombre duplicado)"})
	}

	return c.Status(201).JSON(category)
}

// ListCategories - Público (para que el frontend construya el menú)
func (h *CategoryHandler) GetAll(c *fiber.Ctx) error {
	var categories []models.Category
	h.DB.Find(&categories)
	return c.JSON(categories)
}

// DeleteCategory - Solo Admin (Con regla estricta de no borrado si está en uso)
func (h *CategoryHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")

	var category models.Category
	if err := h.DB.First(&category, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Categoría no encontrada"})
	}

	// REGLA DE NEGOCIO: Verificar si hay entradas asociadas
	// GORM verificará la tabla intermedia entry_categories
	var count int64
	err := h.DB.Table("entry_categories").Where("category_id = ?", id).Count(&count).Error
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al verificar integridad"})
	}

	if count > 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": "No se puede eliminar: esta categoría está siendo usada por entradas de contenido",
		})
	}

	h.DB.Delete(&category)
	return c.JSON(fiber.Map{"message": "Categoría eliminada correctamente"})
}

// UpdateCategory - Solo Admin
func (h *CategoryHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")

	type UpdateRequest struct {
		Name        string              `json:"name"`
		Type        models.CategoryType `json:"type"`
		Description string              `json:"description"`
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var category models.Category
	if err := h.DB.First(&category, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Categoría no encontrada"})
	}

	// Si el nombre cambia, actualizamos el slug para SEO
	if req.Name != "" && req.Name != category.Name {
		category.Name = req.Name
		category.Slug = slugify(req.Name)
	}

	if req.Type != "" {
		category.Type = req.Type
	}

	category.Description = req.Description

	if err := h.DB.Save(&category).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al actualizar la categoría"})
	}

	return c.JSON(category)
}
