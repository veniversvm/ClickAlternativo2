package models

import (
	"time"
)

type CategoryType string

const (
	TypePrimary   CategoryType = "primary"   // Secciones: Software, Gaming, etc.
	TypeSecondary CategoryType = "secondary" // Detalles: "Tutorial", "Review", "Indie", etc.
)

type Category struct {
	ID          uint         `gorm:"primaryKey" json:"id"`
	Name        string       `gorm:"uniqueIndex;not null" json:"name"`
	Slug        string       `gorm:"uniqueIndex;not null" json:"slug"` // Para /seccion/software o /tag/python
	Description string       `gorm:"type:text" json:"description"`     // Para SEO en la página de la categoría
	Type        CategoryType `gorm:"type:varchar(20);default:'secondary';index" json:"type"`

	CreatedAt time.Time `json:"created_at"`

	// Relación muchos a muchos (se define en el modelo Entry también)
	Entries []Entry `gorm:"many2many:entry_categories;" json:"-"`
}
