package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Admin struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Email        string         `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string         `json:"-"`                                   // Siempre oculto
	IsSuperAdmin bool           `gorm:"default:false" json:"is_super_admin"` // Para crear otros admins
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"` // Activa Soft Delete
}

func (a *Admin) BeforeCreate(tx *gorm.DB) (err error) {
	a.ID = uuid.New()
	return
}
