package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/models"
	"gorm.io/gorm"
)

type UserHandler struct {
	DB *gorm.DB
}

// UpdateProfile maneja tanto las preferencias de tags como las de notificaciones
func (h *UserHandler) UpdateProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	// Estructura para recibir el JSON del frontend
	type UpdateRequest struct {
		NotifyEmail bool   `json:"notify_email"`
		NotifyPush  bool   `json:"notify_push"`
		TagIDs      []uint `json:"tag_ids"`
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var user models.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// 1. Actualizar flags de notificación
	user.NotifyEmail = req.NotifyEmail
	user.NotifyPush = req.NotifyPush

	// 2. Actualizar relación Many-to-Many de Tags
	if len(req.TagIDs) > 0 {
		var categories []models.Category
		h.DB.Where("id IN ?", req.TagIDs).Find(&categories)
		// Replace limpia la tabla intermedia 'user_preferred_tags' y pone las nuevas
		h.DB.Model(&user).Association("PreferredTags").Replace(categories)
	} else {
		// Si envía lista vacía, removemos todas las preferencias
		h.DB.Model(&user).Association("PreferredTags").Clear()
	}

	if err := h.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo actualizar el perfil"})
	}

	return c.JSON(fiber.Map{
		"message": "Perfil actualizado correctamente",
		"user":    user,
	})
}

// GetProfile retorna los datos del usuario logueado con sus tags precargadas
func (h *UserHandler) GetProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	var user models.User

	if err := h.DB.Preload("PreferredTags").First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	return c.JSON(user)
}
