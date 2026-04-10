package main

import (
	"log"
	"os"
	"runtime" // Necesario para limitar núcleos
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
	// --- REQUISITO: LIMITAR A 2 NÚCLEOS ---
	// Esto es ideal para optimizar el coste/rendimiento en Contabo
	runtime.GOMAXPROCS(2)

	// Cargar variables de entorno
	godotenv.Load()

	// 1. Inicializar DB y Servicios
	db := database.InitDB()
	authService := services.NewAuthService()
	s3Service, _ := services.NewS3Service(
		os.Getenv("AWS_REGION"),
		os.Getenv("AWS_ACCESS_KEY_ID"),
		os.Getenv("AWS_SECRET_ACCESS_KEY"),
		os.Getenv("AWS_BUCKET_NAME"),
	)

	// 2. Inicializar Fiber con configuración de seguridad
	app := fiber.New(fiber.Config{
		AppName:      "Click Alternativo API v1.0",
		ServerHeader: "Fiber",
		// Límite de cuerpo de petición (3 imágenes + data ≈ 15MB max)
		BodyLimit: 20 * 1024 * 1024,
		// Tiempo de lectura para evitar ataques de conexiones lentas
		ReadTimeout: 30 * time.Second,
	})

	// 3. MIDDLEWARES DE SEGURIDAD E IDEMPOTENCIA

	// A. Recover: Captura errores críticos y evita que el proceso muera
	app.Use(recover.New())

	// B. Helmet: Añade cabeceras de seguridad estándar
	app.Use(helmet.New())

	// C. CORS Endurecido
	app.Use(cors.New(cors.Config{
		AllowOrigins:     os.Getenv("FRONTEND_URL"), // Define esto en tu .env (ej: http://localhost:3000)
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Idempotency-Key",
	}))

	// D. Idempotencia: Crucial para POST/PUT (especialmente creación de Entries)
	// El cliente debe enviar un Header "X-Idempotency-Key" único por petición
	app.Use(idempotency.New())

	// E. Rate Limiter: 100 peticiones por minuto por IP por defecto
	app.Use(limiter.New(limiter.Config{
		Max:        100,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP() // Limitar por IP
		},
	}))

	// F. Logger para auditoría
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
	log.Printf("🔥 Servidor corriendo con 2 núcleos en puerto %s", port)
	log.Fatal(app.Listen(":" + port))
}
