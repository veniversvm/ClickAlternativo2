package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/models"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/services"
	"gorm.io/gorm"
)

type UserAuthHandler struct {
	DB          *gorm.DB
	AuthService *services.AuthService
}

// Helper interno para consistencia de cookies
func (h *UserAuthHandler) setAuthCookie(c *fiber.Ctx, token string) {
	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    token,
		Expires:  time.Now().Add(72 * time.Hour),
		HTTPOnly: true,
		Secure:   false, // Cambiar a true en producción con HTTPS
		SameSite: "Lax",
	})
}

func (h *UserAuthHandler) Register(c *fiber.Ctx) error {
	type Request struct {
		Email    string `json:"email"`
		Username string `json:"username"`
		Password string `json:"password"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	hash, _ := h.AuthService.HashPassword(req.Password)
	user := models.User{
		Email:        req.Email,
		Username:     req.Username,
		PasswordHash: hash,
		AuthProvider: "local",
	}

	if err := h.DB.Create(&user).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Email o Username ya en uso"})
	}

	token, _ := h.AuthService.GenerateJWT(user.ID.String(), "user", false)
	h.setAuthCookie(c, token)

	return c.Status(201).JSON(fiber.Map{"user": user})
}

func (h *UserAuthHandler) Login(c *fiber.Ctx) error {
	type Request struct {
		Identifier string `json:"identifier"`
		Password   string `json:"password"`
	}
	var req Request
	c.BodyParser(&req)

	var user models.User
	if err := h.DB.Where("email = ? OR username = ?", req.Identifier, req.Identifier).First(&user).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Credenciales inválidas"})
	}

	if !h.AuthService.CheckPasswordHash(req.Password, user.PasswordHash) {
		return c.Status(401).JSON(fiber.Map{"error": "Credenciales inválidas"})
	}

	token, _ := h.AuthService.GenerateJWT(user.ID.String(), "user", false)
	h.setAuthCookie(c, token)

	return c.JSON(fiber.Map{"user": user})
}

func (h *UserAuthHandler) Logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
		Secure:   false,
		SameSite: "Lax",
	})
	return c.JSON(fiber.Map{"message": "Sesión cerrada"})
}
