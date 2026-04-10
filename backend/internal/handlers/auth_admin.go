package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/models"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/services"
	"gorm.io/gorm"
)

type AdminHandler struct {
	DB          *gorm.DB
	AuthService *services.AuthService
}

func (h *AdminHandler) Login(c *fiber.Ctx) error {
	type Request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	var req Request
	c.BodyParser(&req)

	var admin models.Admin
	if err := h.DB.Where("email = ?", req.Email).First(&admin).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "No autorizado"})
	}

	if !h.AuthService.CheckPasswordHash(req.Password, admin.PasswordHash) {
		return c.Status(401).JSON(fiber.Map{"error": "No autorizado"})
	}

	// Importante: admin.IsSuperAdmin se pasa al JWT
	token, _ := h.AuthService.GenerateJWT(admin.ID.String(), "admin", admin.IsSuperAdmin)

	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    token,
		Expires:  time.Now().Add(72 * time.Hour),
		HTTPOnly: true,
		Secure:   false,
		SameSite: "Lax",
	})

	return c.JSON(fiber.Map{"message": "Bienvenido Admin"})
}

func (h *AdminHandler) Logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
		Secure:   false,
		SameSite: "Lax",
	})
	return c.JSON(fiber.Map{"message": "Sesión de Admin cerrada"})
}
