package handlers

import (
	"os"
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

	// En internal/handlers/auth_user.go y auth_admin.go
	isProd := os.Getenv("NODE_ENV") == "production"

	c.Cookie(&fiber.Cookie{
		Name:     "jwt", // o "admin_jwt"
		Value:    token,
		Expires:  time.Now().Add(72 * time.Hour),
		HTTPOnly: true,
		Path:     "/",
		SameSite: "Lax",
		// --- ESTO ES LO MÁS IMPORTANTE ---
		Secure: isProd,                     // True si es HTTPS (Producción)
		Domain: os.Getenv("COOKIE_DOMAIN"), // e.g. "clickalternativo.com"
	})

	return c.JSON(fiber.Map{"message": "Bienvenido Admin"})
}
func (h *AdminHandler) Logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "admin_jwt", // <--- DEBE SER ESTE NOMBRE
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
		Secure:   false, // true en producción
		SameSite: "Lax",
		Path:     "/", // <--- OBLIGATORIO: El mismo path que el login
	})

	return c.Status(200).JSON(fiber.Map{"message": "Sesión de Admin cerrada"})
}
