package services

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"net/http"

	"github.com/nfnt/resize"
)

// ProcessImage limpia malware (re-encoding) y comprime si es > 1MB
func ProcessImage(file io.Reader, size int64) (io.Reader, string, error) {
	// 1. Detectar formato real (Seguridad: no confiar en la extensión)
	buffer := make([]byte, 512)
	_, err := file.Read(buffer)
	if err != nil {
		return nil, "", err
	}
	contentType := http.DetectContentType(buffer)

	// Resetear el reader para procesarlo completo
	fullReader := io.MultiReader(bytes.NewReader(buffer), file)

	// 2. Decodificar imagen (Limpia metadatos maliciosos)
	img, format, err := image.Decode(fullReader)
	if err != nil {
		return nil, "", fmt.Errorf("formato de imagen no soportado o corrupto")
	}

	// 3. Compresión si excede 1MB (1 << 20 bytes)
	var output bytes.Buffer
	quality := 85 // Calidad inicial aceptable

	if size > (1 * 1024 * 1024) {
		// Redimensionar si es muy grande (opcional, ej: Max 1920px ancho)
		img = resize.Thumbnail(1920, 1080, img, resize.Lanczos3)
		quality = 70 // Más compresión si es pesado
	}

	// 4. Re-codificar (Esto genera un archivo "limpio" de scripts)
	if format == "png" {
		err = png.Encode(&output, img)
	} else {
		err = jpeg.Encode(&output, img, &jpeg.Options{Quality: quality})
	}

	return &output, contentType, err
}
