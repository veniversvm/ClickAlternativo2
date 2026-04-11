import { A } from "@solidjs/router";
import { SiInstagram, SiTiktok, SiYoutube } from "solid-icons/si";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="main-footer">
      {/* Siempre visible */}
      <div class="footer-column footer-social">
        <div class="social-icons">
          <a href="https://youtube.com/@Click_Alternativo" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <SiYoutube size={24} />
          </a>
          <a href="https://instagram.com/Click_Alternativo" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <SiInstagram size={24} />
          </a>
          <a href="https://tiktok.com/@Click_Alternativo" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
            <SiTiktok size={24} />
          </a>
        </div>
      </div>

      {/* Solo visible en mobile: copyright compacto */}
      <p class="footer-copyright-mobile">© {currentYear} Click Alternativo</p>

      {/* Oculto en mobile, visible en desktop */}
      <div class="footer-desktop-only">
        <div class="footer-column footer-social-handle">
          <a href="https://instagram.com/Click_Alternativo" target="_blank" rel="noopener noreferrer" class="social-handle">
            @Click_Alternativo
          </a>
        </div>

        <div class="footer-column footer-info">
          <p class="copyright">Copyright © {currentYear} Click Alternativo</p>
          <p class="copyright">Todos los derechos reservados.</p>
        </div>

        <div class="footer-column footer-support">
          <p>¿Te gusta nuestro trabajo?</p>
          <A href="/apoyanos" class="support-button">¡APOYANOS!</A>
        </div>
      </div>
    </footer>
  );
}