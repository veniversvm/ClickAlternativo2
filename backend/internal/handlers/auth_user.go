package handlers

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/models"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/services"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gorm.io/gorm"
)

type UserAuthHandler struct {
	DB           *gorm.DB
	AuthService  *services.AuthService
	Notification *services.NotificationService
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

	if h.Notification == nil {
		log.Println("🚨 REGISTER ALERTA: UserAuthHandler.Notification es NIL. No se enviarán correos.")
	} else {
		log.Println("✅ REGISTER UserAuthHandler.Notification detectado correctamente.")
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

	// --- ENVIAR CORREO DE BIENVENIDA (Asíncrono) ---
	if h.Notification != nil {
		go h.Notification.SendWelcomeEmail(user)
	}

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

func getGoogleConfig() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_CALLBACK_URL"),
		Endpoint:     google.Endpoint,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
	}
}

// GoogleLogin - Redirige al usuario a Google
func (h *UserAuthHandler) GoogleLogin(c *fiber.Ctx) error {
	url := getGoogleConfig().AuthCodeURL("state-token") // En prod, usa un token real para 'state'
	return c.Redirect(url)
}

// GoogleCallback - Procesa la respuesta de Google
// GoogleCallback - Procesa la respuesta de Google
func (h *UserAuthHandler) GoogleCallback(c *fiber.Ctx) error {
	code := c.Query("code")
	config := getGoogleConfig()

	// 1. Intercambiar código por token
	token, err := config.Exchange(context.Background(), code)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Fallo al intercambiar código"})
	}

	// 2. Obtener info del usuario desde Google
	client := config.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "No se pudo obtener info de usuario"})
	}
	defer resp.Body.Close()

	var googleUser struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Picture string `json:"picture"`
	}
	json.NewDecoder(resp.Body).Decode(&googleUser)

	// 3. LÓGICA DE SUSCRIPCIÓN ÚNICA
	var user models.User
	isNewUser := false

	// Buscamos si el usuario ya existe
	result := h.DB.Where("email = ?", googleUser.Email).First(&user)

	if result.Error != nil {
		// Si no existe (GORM retorna error RecordNotFound), lo creamos
		isNewUser = true
		user = models.User{
			Email:        googleUser.Email,
			AuthProvider: "google",
			ExternalID:   googleUser.ID,
			AvatarURL:    googleUser.Picture,
			Username:     googleUser.Email, // Username temporal
		}
		if err := h.DB.Create(&user).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "No se pudo crear el usuario"})
		}
	} else {
		// Si ya existe, opcionalmente actualizamos el avatar por si cambió en Google
		user.AvatarURL = googleUser.Picture
		h.DB.Save(&user)
	}

	// 4. Generar nuestro JWT y poner la Cookie
	jwtToken, _ := h.AuthService.GenerateJWT(user.ID.String(), "user", false)

	// En internal/handlers/auth_user.go y auth_admin.go
	isProd := os.Getenv("NODE_ENV") == "production"

	c.Cookie(&fiber.Cookie{
		Name:     "jwt", // o "admin_jwt"
		Value:    jwtToken,
		Expires:  time.Now().Add(72 * time.Hour),
		HTTPOnly: true,
		Path:     "/",
		SameSite: "Lax",
		// --- ESTO ES LO MÁS IMPORTANTE ---
		Secure: isProd,                     // True si es HTTPS (Producción)
		Domain: os.Getenv("COOKIE_DOMAIN"), // e.g. "clickalternativo.com"
	})
	// --- ENVIAR CORREO SOLO SI ES NUEVO ---
	if isNewUser && h.Notification != nil {
		go h.Notification.SendWelcomeEmail(user)
	}

	// 5. Redirigir de vuelta al Frontend
	return c.Redirect(os.Getenv("FRONTEND_URL"))
}
