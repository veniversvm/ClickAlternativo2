package services

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"mime/multipart"
	"net/smtp"
	"net/textproto"
	"os"
)

type EmailService struct {
	host string
	port string
	user string
	pass string
	from string
}

func NewEmailService(host, port, user, pass, from string) *EmailService {
	return &EmailService{host, port, user, pass, from}
}

func (s *EmailService) SendEmail(to string, subject string, body string) error {
	auth := smtp.PlainAuth("", s.user, s.pass, s.host)

	// Construcción del mensaje con MIME para HTML
	header := make(map[string]string)
	header["From"] = s.from
	header["To"] = to
	header["Subject"] = subject
	header["MIME-Version"] = "1.0"
	header["Content-Type"] = "text/html; charset=\"utf-8\""

	message := ""
	for k, v := range header {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body

	addr := fmt.Sprintf("%s:%s", s.host, s.port)
	return smtp.SendMail(addr, auth, s.from, []string{to}, []byte(message))
}

func (s *EmailService) SendNotificationWithLogo(to string, subject string, htmlBody string) error {
	addr := fmt.Sprintf("%s:%s", s.host, s.port)
	auth := smtp.PlainAuth("", s.user, s.pass, s.host)

	// 1. Leer el logo
	logoPath := "assets/Logo/LogoClickAlternativo.png"
	logoData, err := os.ReadFile(logoPath)
	if err != nil {
		return fmt.Errorf("error leyendo logo: %v", err)
	}

	// 2. Preparar el mensaje
	buf := new(bytes.Buffer)
	writer := multipart.NewWriter(buf)

	// Headers principales
	buf.WriteString(fmt.Sprintf("From: %s\r\n", s.from))
	buf.WriteString(fmt.Sprintf("To: %s\r\n", to))
	buf.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	buf.WriteString("MIME-Version: 1.0\r\n")
	buf.WriteString(fmt.Sprintf("Content-Type: multipart/related; boundary=%s\r\n", writer.Boundary()))
	buf.WriteString("\r\n")

	// --- PARTE 1: HTML (Usamos 8bit para no romper los '=') ---
	htmlPart, _ := writer.CreatePart(textproto.MIMEHeader{
		"Content-Type":              {"text/html; charset=utf-8"},
		"Content-Transfer-Encoding": {"8bit"},
	})
	htmlPart.Write([]byte(htmlBody))

	// --- PARTE 2: LOGO ---
	logoPart, _ := writer.CreatePart(textproto.MIMEHeader{
		"Content-Type":              {"image/png"},
		"Content-Transfer-Encoding": {"base64"},
		"Content-ID":                {"<logo>"},
		"Content-Disposition":       {"inline; filename=\"logo.png\""},
	})

	encoder := base64.NewEncoder(base64.StdEncoding, logoPart)
	encoder.Write(logoData)
	encoder.Close()

	writer.Close()

	return smtp.SendMail(addr, auth, s.from, []string{to}, buf.Bytes())
}
