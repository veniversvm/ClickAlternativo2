package services

import (
	"fmt"

	"github.com/veniversvm/ClickAlternativo2/backend/internal/models"
)

func BuildNewEntryEmail(user models.User, entry models.Entry) string {
	categorySlug := "blog"
	if len(entry.Categories) > 0 {
		categorySlug = entry.Categories[0].Slug
	}

	return fmt.Sprintf(`
	<!DOCTYPE html>
	<html lang="es">
	<head>
		<meta charset="UTF-8">
		<style>
			body { font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; margin: 0; padding: 0; }
			.container { max-width: 600px; margin: 20px auto; background-color: #1e1e1e; border: 1px solid #6BBF5B; border-radius: 15px; overflow: hidden; }
			.header { background-color: #000000; padding: 25px; text-align: center; border-bottom: 2px solid #6BBF5B; }
			.logo { width: 160px; height: auto; }
			.content { padding: 30px; text-align: center; }
			.entry-image { width: 100%%; max-height: 300px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #333; display: block; }
			.title { color: #6BBF5B; font-size: 24px; margin: 0 0 15px 0; font-weight: bold; }
			.description { color: #dddddd; line-height: 1.6; font-size: 16px; margin-bottom: 30px; text-align: left; }
			.btn { background-color: #6BBF5B; color: #121212 !important; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; }
			.footer { padding: 20px; background-color: #000000; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #333; }
		</style>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<img src="cid:logo" alt="Logo" class="logo">
			</div>
			<div class="content">
				<p style="color: #888;">¡Hola, %s!</p>
				<p style="margin-bottom: 20px;">Nueva curaduría para ti:</p>
				<img src="%s" class="entry-image">
				<h2 class="title">%s</h2>
				<p class="description">%s</p>
				<a href="https://clickalternativo.com/%s/%s" class="btn">LEER AHORA</a>
			</div>
			<div class="footer">
				<p>© 2025 Click Alternativo</p>
			</div>
		</div>
	</body>
	</html>`, user.Username, entry.ImageURL1, entry.Title, entry.Description, categorySlug, entry.Slug)
}

func BuildWelcomeEmail(user models.User) string {
	return fmt.Sprintf(`
	<!DOCTYPE html>
	<html lang="es">
	<head>
		<meta charset="UTF-8">
		<style>
			body { font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; margin: 0; padding: 0; }
			.container { max-width: 600px; margin: 20px auto; background-color: #1e1e1e; border: 1px solid #6BBF5B; border-radius: 15px; overflow: hidden; }
			.header { background-color: #000000; padding: 30px; text-align: center; border-bottom: 2px solid #6BBF5B; }
			.logo { width: 180px; height: auto; }
			.content { padding: 40px; text-align: center; }
			.title { color: #6BBF5B; font-size: 28px; margin-bottom: 15px; font-weight: bold; }
			.text { color: #cccccc; line-height: 1.8; font-size: 16px; margin-bottom: 30px; }
			.btn { background-color: #6BBF5B; color: #121212 !important; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 10px; display: inline-block; }
			.footer { padding: 25px; background-color: #000000; text-align: center; font-size: 12px; color: #666666; border-top: 1px solid #333; }
		</style>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<img src="cid:logo" alt="Logo" class="logo">
			</div>
			<div class="content">
				<h1 class="title">¡Bienvenido!</h1>
				<p class="text">Hola <strong>%s</strong>, gracias por unirte a Click Alternativo.</p>
				<a href="https://clickalternativo.com/perfil" class="btn">CONFIGURAR MI PERFIL</a>
			</div>
			<div class="footer">
				<p>© 2025 Click Alternativo</p>
			</div>
		</div>
	</body>
	</html>`, user.Username)
}
