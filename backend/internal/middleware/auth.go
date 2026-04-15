package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// 1. Protected: Busca el token en admin_jwt, luego en jwt y finalmente en el Header
func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// --- LÓGICA DE PRIORIDAD DE COOKIES ---
		// Primero buscamos la cookie de admin
		tokenString := c.Cookies("admin_jwt")

		// Si no hay, buscamos la de usuario regular
		if tokenString == "" {
			tokenString = c.Cookies("jwt")
		}

		// Fallback al Header Authorization (útil para desarrollo/Postman)
		if tokenString == "" {
			authHeader := c.Get("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		// Si después de buscar en los 3 sitios no hay nada, error
		if tokenString == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Inicie sesión para continuar"})
		}

		// Validar el Token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Sesión inválida o expirada"})
		}

		// Extraer Claims y guardarlos en Locals
		claims := token.Claims.(jwt.MapClaims)
		c.Locals("user_id", claims["sub"])
		c.Locals("role", claims["role"])
		c.Locals("is_super", claims["is_super"])

		return c.Next()
	}
}

// 2. OnlyAdmin: Se mantiene igual
func OnlyAdmin() fiber.Handler {
	return func(c *fiber.Ctx) error {
		role := c.Locals("role")
		if role != "admin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Acceso denegado: se requieren permisos de administrador"})
		}
		return c.Next()
	}
}

// 3. OnlySuperAdmin: Se mantiene igual
func OnlySuperAdmin() fiber.Handler {
	return func(c *fiber.Ctx) error {
		isSuper, ok := c.Locals("is_super").(bool)
		if !ok || !isSuper {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Acceso denegado: se requieren privilegios de SuperAdmin"})
		}
		return c.Next()
	}
}
