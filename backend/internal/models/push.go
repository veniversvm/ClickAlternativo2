package models

import (
	"time"

	"github.com/google/uuid"
)

type PushSubscription struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uuid.UUID `gorm:"type:uuid;index"` // Dueño de la suscripción
	Endpoint  string    `gorm:"uniqueIndex;not null"`
	P256dh    string    `gorm:"not null"`
	Auth      string    `gorm:"not null"`
	CreatedAt time.Time
}
