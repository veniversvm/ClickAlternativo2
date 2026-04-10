package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	Username     string    `gorm:"uniqueIndex" json:"username"` // Puede ser opcional para Google
	PasswordHash string    `json:"-"`                           // Puede ser nulo si es solo Google

	// Datos de OAuth
	AuthProvider string `gorm:"type:varchar(20);default:'local'" json:"auth_provider"`
	ExternalID   string `gorm:"index" json:"external_id"`
	AvatarURL    string `json:"avatar_url"`

	// Configuración de Notificaciones (Regla de negocio 3)
	NotifyEmail   bool       `gorm:"default:true" json:"notify_email"`
	NotifyPush    bool       `gorm:"default:true" json:"notify_push"`
	PreferredTags []Category `gorm:"many2many:user_preferred_tags;" json:"preferred_tags"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return
}
