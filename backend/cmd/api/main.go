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

	// 1. Inicialización de DB
	db := database.InitDB()
	authService := services.NewAuthService()

	// 2. Inicialización de Servicios de Infraestructura (S3, Email, Notificaciones)
	s3Service, err := services.NewS3Service(
		os.Getenv("AWS_REGION"),
		os.Getenv("AWS_ACCESS_KEY_ID"),
		os.Getenv("AWS_SECRET_ACCESS_KEY"),
		os.Getenv("AWS_BUCKET_NAME"),
		os.Getenv("S3_ENDPOINT"),
		os.Getenv("S3_PUBLIC_URL"),
	)
	if err != nil {
		log.Fatalf("❌ Error inicializando S3/MinIO: %v", err)
	}

	emailService := services.NewEmailService(
		os.Getenv("SMTP_HOST"),
		os.Getenv("SMTP_PORT"),
		os.Getenv("SMTP_USER"),
		os.Getenv("SMTP_PASS"),
		os.Getenv("SMTP_FROM"),
	)

	// Creamos el servicio de notificaciones antes que los handlers
	notiService := services.NewNotificationService(db, emailService)

	// 3. Inicializar Fiber
	app := fiber.New(fiber.Config{
		AppName:      "Click Alternativo API v1.0",
		ServerHeader: "Fiber",
		BodyLimit:    20 * 1024 * 1024,
		ReadTimeout:  30 * time.Second,
		ProxyHeader:  "X-Forwarded-For",
	})

	// 4. Middlewares
	app.Use(recover.New())
	app.Use(helmet.New())

	allowedOrigins := os.Getenv("FRONTEND_URL")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:3000"
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Idempotency-Key",
	}))

	app.Use(idempotency.New())
	app.Use(logger.New())

	// 5. INYECCIÓN DE DEPENDENCIAS EN HANDLERS (Orden Corregido)
	adminHandler := &handlers.AdminHandler{DB: db, AuthService: authService}

	userAuthHandler := &handlers.UserAuthHandler{
		DB:           db,
		AuthService:  authService,
		Notification: notiService, // <--- AHORA SÍ TIENE VALOR
	}

	entryHandler := &handlers.EntryHandler{
		DB:           db,
		S3:           s3Service,
		Notification: notiService, // <--- AHORA SÍ TIENE VALOR
	}

	userHandler := &handlers.UserHandler{DB: db}
	categoryHandler := &handlers.CategoryHandler{DB: db}
	mgmtHandler := &handlers.AdminMgmtHandler{DB: db, AuthService: authService}

	// 6. Configurar Router (Solo pasamos los handlers)
	router.SetupRoutes(
		app,
		adminHandler,
		userAuthHandler,
		userHandler,
		categoryHandler,
		entryHandler,
		mgmtHandler,
	)

	// 7. Iniciar Servidor
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("🚀 API lista en puerto %s", port)
	log.Fatal(app.Listen(":" + port))
}
