package services

import (
	"log"

	"github.com/veniversvm/ClickAlternativo2/backend/internal/models"
	"gorm.io/gorm"
)

type NotificationService struct {
	db    *gorm.DB
	email *EmailService
}

func NewNotificationService(db *gorm.DB, email *EmailService) *NotificationService {
	return &NotificationService{db, email}
}

// NotifyNewEntry busca usuarios interesados y les envía un correo
func (s *NotificationService) NotifyNewEntry(entry *models.Entry) {
	// 1. Obtener IDs de las categorías que el handler ya cargó en el objeto entry
	catIDs := []uint{}
	for _, cat := range entry.Categories {
		catIDs = append(catIDs, cat.ID)
	}

	if len(catIDs) == 0 {
		log.Println("🔔 Notificación omitida: La entrada no tiene categorías.")
		return
	}

	// 2. Buscar usuarios interesados (con notify_email activo y que sigan esas tags)
	var users []models.User
	s.db.Distinct().
		Joins("JOIN user_preferred_tags ON user_preferred_tags.user_id = users.id").
		Where("user_preferred_tags.category_id IN ?", catIDs).
		Where("users.notify_email = ?", true).
		Find(&users)

	if len(users) == 0 {
		return
	}

	// 3. Enviar correos en paralelo
	for _, user := range users {
		u := user
		go func() {
			subject := "✨ Nuevo contenido seleccionado: " + entry.Title
			body := BuildNewEntryEmail(u, *entry) // Ya no pasamos logoURL

			s.email.SendNotificationWithLogo(u.Email, subject, body)
		}()
	}

	log.Printf("📧 Notificaciones enviadas a %d usuarios para el post: %s", len(users), entry.Title)
}

func (s *NotificationService) SendWelcomeEmail(user models.User) {
	subject := "👋 ¡Bienvenido a Click Alternativo!"
	body := BuildWelcomeEmail(user)

	// CAMBIO AQUÍ: Llamamos al método que adjunta el logo
	if err := s.email.SendNotificationWithLogo(user.Email, subject, body); err != nil {
		log.Printf("⚠️ Error enviando bienvenida a %s: %v", user.Email, err)
	} else {
		log.Printf("✅ Bienvenida enviada a %s con logo adjunto", user.Email)
	}
}
