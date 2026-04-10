package services

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	jwtSecret []byte
}

func NewAuthService() *AuthService {
	return &AuthService{
		jwtSecret: []byte(os.Getenv("JWT_SECRET")),
	}
}

// HashPassword convierte texto plano en hash
func (s *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPasswordHash compara password con el hash
func (s *AuthService) CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateJWT crea un token con el ID y el Rol (admin o user)
// GenerateJWT ahora acepta un tercer parámetro booleano
func (s *AuthService) GenerateJWT(id string, role string, isSuper bool) (string, error) {
	claims := jwt.MapClaims{
		"sub":      id,
		"role":     role,
		"is_super": isSuper, // Ahora viene del parámetro
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}
