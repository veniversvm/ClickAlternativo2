package main

import (
	"log"
	"os"
	"runtime"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/idempotency"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/database"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/handlers"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/router"
	"github.com/veniversvm/ClickAlternativo2/backend/internal/services"
)

func main() {
	runtime.GOMAXPROCS(2)
	godotenv.Load()

	// 1. Inicialización de DB y Servicios
	db := database.InitDB()
	authService := services.NewAuthService()
	s3Service, err := services.NewS3Service(
		os.Getenv("AWS_REGION"),
		os.Getenv("AWS_ACCESS_KEY_ID"),
		os.Getenv("AWS_SECRET_ACCESS_KEY"),
		os.Getenv("AWS_BUCKET_NAME"),
		os.Getenv("S3_ENDPOINT"),
	)
	if err != nil {
		log.Fatalf("❌ Error inicializando S3/MinIO: %v", err)
	}

	// 2. Configuración de Fiber
	app := fiber.New(fiber.Config{
		AppName:      "Click Alternativo API v1.0",
		ServerHeader: "Fiber",
		BodyLimit:    20 * 1024 * 1024,
		ReadTimeout:  30 * time.Second,
		// CRÍTICO: Permite que Fiber obtenga la IP real si usas Nginx o Docker
		ProxyHeader: "X-Forwarded-For",
	})

	// 3. MIDDLEWARES

	app.Use(recover.New())
	app.Use(helmet.New())

	// --- AJUSTE DE CORS ---
	// Obtenemos las URLs permitidas del .env (separadas por coma)
	// Ejemplo: FRONTEND_URL=http://localhost:3000,http://tudominio.com
	allowedOrigins := os.Getenv("FRONTEND_URL")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:3000"
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowCredentials: true, // REQUISITO para HttpOnly Cookies
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Idempotency-Key",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		ExposeHeaders:    "X-Idempotency-Key", // Permite que el frontend lea la llave si es necesario
	}))

	app.Use(idempotency.New())

	// --- RATE LIMITER REFORZADO ---
	app.Use(limiter.New(limiter.Config{
		Max:               120,
		Expiration:        1 * time.Minute,
		LimiterMiddleware: limiter.FixedWindow{},
		KeyGenerator: func(c *fiber.Ctx) string {
			// Usar el header de IP real si está disponible
			return c.Get("X-Forwarded-For", c.IP())
		},
	}))

	app.Use(logger.New())

	// 4. Inyección de Dependencias
	adminHandler := &handlers.AdminHandler{DB: db, AuthService: authService}
	userAuthHandler := &handlers.UserAuthHandler{DB: db, AuthService: authService}
	userHandler := &handlers.UserHandler{DB: db}
	categoryHandler := &handlers.CategoryHandler{DB: db}
	entryHandler := &handlers.EntryHandler{DB: db, S3: s3Service}
	mgmtHandler := &handlers.AdminMgmtHandler{DB: db, AuthService: authService}

	// 5. Configurar Router
	router.SetupRoutes(
		app,
		adminHandler,
		userAuthHandler,
		userHandler,
		categoryHandler,
		entryHandler,
		mgmtHandler,
	)

	// 6. Iniciar Servidor
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 API lista en puerto %s con núcleos limitados a 2", port)
	log.Fatal(app.Listen(":" + port))
}
