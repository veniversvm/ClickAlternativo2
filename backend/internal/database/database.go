package database

import (
	"fmt"
	"log"
	"os"

	"github.com/veniversvm/ClickAlternativo2/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDB() *gorm.DB {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ No se pudo conectar a la base de datos: %v", err)
	}

	log.Println("✅ Conexión a la base de datos establecida")

	// Ejecutar migraciones en orden
	err = db.AutoMigrate(
		&models.Admin{},
		&models.User{},
		&models.Category{},
		&models.Entry{},
	)

	if err != nil {
		log.Fatalf("❌ Error en la migración de tablas: %v", err)
	}

	log.Println("🚀 Tablas migradas/actualizadas correctamente")
	return db
}
