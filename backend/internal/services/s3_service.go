package services

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

type S3Service struct {
	client     *s3.Client
	bucketName string
	region     string
}

// NewS3Service inicializa la configuración de AWS
func NewS3Service(region, accessKey, secretKey, bucketName string) (*S3Service, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		return nil, fmt.Errorf("error cargando configuración de AWS: %w", err)
	}

	client := s3.NewFromConfig(cfg)
	return &S3Service{
		client:     client,
		bucketName: bucketName,
		region:     region,
	}, nil
}

// UploadImage sube una imagen y retorna la URL pública
func (s *S3Service) UploadImage(file io.Reader, fileName string, contentType string) (string, error) {
	// Generar nombre único: uuid + extensión original
	ext := filepath.Ext(fileName)
	newFileName := fmt.Sprintf("entries/%s%s", uuid.New().String(), ext)

	_, err := s.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(s.bucketName),
		Key:         aws.String(newFileName),
		Body:        file,
		ContentType: aws.String(contentType),
		// ACL: aws.String("public-read"), // Descomentar si el bucket permite ACLs públicas
	})

	if err != nil {
		return "", fmt.Errorf("error subiendo archivo a S3: %w", err)
	}

	// Retornar la URL de la imagen
	// Si usas CloudFront o dominio personalizado, cámbialo aquí
	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucketName, s.region, newFileName)
	return url, nil
}

// DeleteImageByUrl extrae la llave de la URL y elimina el objeto de S3
func (s *S3Service) DeleteImageByUrl(fullURL string) error {
	if fullURL == "" {
		return nil
	}

	// Ejemplo URL: https://mi-bucket.s3.us-east-1.amazonaws.com/entries/uuid.jpg
	// La Key es: entries/uuid.jpg
	// Buscamos la parte después del dominio de amazonaws.com/
	parts := strings.Split(fullURL, ".com/")
	if len(parts) < 2 {
		return fmt.Errorf("URL de S3 inválida")
	}
	key := parts[1]

	_, err := s.client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	})

	if err != nil {
		return fmt.Errorf("error borrando objeto de S3: %w", err)
	}

	return nil
}
