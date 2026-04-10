package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// 1. Protected: Solo verifica que el token sea válido y guarda los datos en Locals
func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// 1. Intentar obtener token de la Cookie
		tokenString := c.Cookies("jwt")

		// 2. Fallback al Header Authorization (útil para desarrollo/Postman)
		if tokenString == "" {
			authHeader := c.Get("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenString == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Inicie sesión para continuar"})
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Sesión inválida o expirada"})
		}

		claims := token.Claims.(jwt.MapClaims)
		c.Locals("user_id", claims["sub"])
		c.Locals("role", claims["role"])
		c.Locals("is_super", claims["is_super"])

		return c.Next()
	}
}

// 2. OnlyAdmin: Verifica que el rol sea admin
func OnlyAdmin() fiber.Handler {
	return func(c *fiber.Ctx) error {
		role := c.Locals("role")
		if role != "admin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Acceso denegado: se requieren permisos de administrador"})
		}
		return c.Next()
	}
}

// 3. OnlySuperAdmin: Verifica específicamente el flag is_super
func OnlySuperAdmin() fiber.Handler {
	return func(c *fiber.Ctx) error {
		isSuper, ok := c.Locals("is_super").(bool)
		if !ok || !isSuper {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Acceso denegado: se requieren privilegios de SuperAdmin"})
		}
		return c.Next()
	}
}
