package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Entry struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	Slug        string    `gorm:"uniqueIndex;not null" json:"slug"`
	Description string    `json:"description"`
	Content     string    `json:"content"`
	ContentURL  string    `json:"content_url"`
	// Tres imágenes posibles
	ImageURL1 string `json:"image_url_1"` // Principal
	ImageURL2 string `json:"image_url_2"`
	ImageURL3 string `json:"image_url_3"`

	Categories []Category `gorm:"many2many:entry_categories;" json:"categories"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (e *Entry) BeforeCreate(tx *gorm.DB) (err error) {
	e.ID = uuid.New()
	return
}
