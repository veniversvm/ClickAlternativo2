package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/models"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/services"
	"gorm.io/gorm"
)

type AdminMgmtHandler struct {
	DB          *gorm.DB
	AuthService *services.AuthService
}

// CreateAdmin - Solo SuperAdmin
func (h *AdminMgmtHandler) Create(c *fiber.Ctx) error {
	// Verificar si quien ejecuta es SuperAdmin
	if isSuper := c.Locals("is_super"); isSuper != true {
		return c.Status(403).JSON(fiber.Map{"error": "Solo un SuperAdmin puede crear otros administradores"})
	}

	type Request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		IsSuper  bool   `json:"is_super"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	hash, _ := h.AuthService.HashPassword(req.Password)
	newAdmin := models.Admin{
		Email:        req.Email,
		PasswordHash: hash,
		IsSuperAdmin: req.IsSuper,
	}

	if err := h.DB.Create(&newAdmin).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al crear administrador (posible email duplicado)"})
	}

	return c.Status(201).JSON(newAdmin)
}

// UpdateAdmin - Editar datos o promover
func (h *AdminMgmtHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var admin models.Admin

	if err := h.DB.First(&admin, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Administrador no encontrado"})
	}

	type UpdateRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		IsSuper  *bool  `json:"is_super"` // Puntero para detectar si viene el booleano
	}

	var req UpdateRequest
	c.BodyParser(&req)

	if req.Email != "" {
		admin.Email = req.Email
	}
	if req.Password != "" {
		hash, _ := h.AuthService.HashPassword(req.Password)
		admin.PasswordHash = hash
	}
	if req.IsSuper != nil {
		admin.IsSuperAdmin = *req.IsSuper
	}

	h.DB.Save(&admin)
	return c.JSON(admin)
}

// DeleteAdmin - Borrado Lógico (Soft Delete)
func (h *AdminMgmtHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")

	// No permitir que un admin se borre a sí mismo accidentalmente
	currentAdminID := c.Locals("user_id").(string)
	if id == currentAdminID {
		return c.Status(400).JSON(fiber.Map{"error": "No puedes eliminar tu propia cuenta"})
	}

	// GORM realiza automáticamente el Soft Delete al detectar DeletedAt
	if err := h.DB.Delete(&models.Admin{}, "id = ?", id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al eliminar"})
	}

	return c.JSON(fiber.Map{"message": "Administrador desactivado correctamente"})
}

func (h *AdminMgmtHandler) List(c *fiber.Ctx) error {
	var admins []models.Admin
	h.DB.Find(&admins)
	return c.JSON(admins)
}
