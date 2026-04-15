package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/handlers"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/middleware"
)

func SetupRoutes(app *fiber.App,
	adminHandler *handlers.AdminHandler,
	userAuthHandler *handlers.UserAuthHandler,
	userHandler *handlers.UserHandler,
	categoryHandler *handlers.CategoryHandler,
	entryHandler *handlers.EntryHandler,
	mgmtHandler *handlers.AdminMgmtHandler,

) {
	// 1. Grupo Base API
	api := app.Group("/api/v1")

	// --- RUTAS PÚBLICAS ---
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "message": "Click Alternativo API v1.0"})
	})

	// Autenticación Mixta
	auth := api.Group("/auth")
	auth.Post("/admin/login", adminHandler.Login)
	auth.Post("/admin/logout", adminHandler.Logout)
	auth.Post("/user/register", userAuthHandler.Register)
	auth.Post("/user/login", userAuthHandler.Login)
	auth.Post("/user/logout", userAuthHandler.Logout)

	// --- NUEVAS: Google OAuth ---
	auth.Get("/google/login", userAuthHandler.GoogleLogin)
	auth.Get("/google/callback", userAuthHandler.GoogleCallback)

	// Contenido Público (Optimizado para SEO)
	api.Get("/categories", categoryHandler.GetAll)
	api.Get("/entries", entryHandler.GetPaginated)
	api.Get("/entries/:slug", entryHandler.GetBySlug)

	// --- RUTAS PROTEGIDAS (USUARIOS REGULARES) ---
	user := api.Group("/user")
	user.Use(middleware.Protected())
	user.Get("/profile", userHandler.GetProfile)
	user.Put("/profile", userHandler.UpdateProfile)

	// --- RUTAS PROTEGIDAS (ADMINS) ---
	admin := api.Group("/admin")
	admin.Use(middleware.Protected())
	admin.Use(middleware.OnlyAdmin())
	admin.Get("/me", mgmtHandler.GetCurrentAdmin) // Ruta: /api/v1/admin/me

	// Gestión de Categorías
	admin.Post("/categories", categoryHandler.Create)
	admin.Put("/categories/:id", categoryHandler.Update)
	admin.Delete("/categories/:id", categoryHandler.Delete)

	// Gestión de Entradas (Curaduría)
	admin.Post("/entries", entryHandler.Create)
	admin.Put("/entries/:id", entryHandler.Update)
	admin.Delete("/entries/:id", entryHandler.Delete)

	// --- RUTAS PROTEGIDAS (SUPER-ADMIN) ---
	// Gestión de otros administradores
	super := admin.Group("/management")
	super.Use(middleware.OnlySuperAdmin())
	super.Get("/users", mgmtHandler.List)
	super.Post("/users", mgmtHandler.Create)
	super.Put("/users/:id", mgmtHandler.Update)
	super.Delete("/users/:id", mgmtHandler.Delete)
}
