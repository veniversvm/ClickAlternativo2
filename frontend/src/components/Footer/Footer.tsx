import { SiYoutube, SiInstagram, SiTiktok } from 'solid-icons/si';
import { A } from "@solidjs/router";
import "./footer.scss";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="main-footer">
      {/* COLUMNA IZQUIERDA: REDES SOCIALES */}
      <div class="footer-column footer-social">
        <div class="social-icons">
          <a
            href="https://youtube.com/@Click_Alternativo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
          >
            <SiYoutube size={24} />
          </a>
          <a
            href="https://instagram.com/Click_Alternativo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <SiInstagram size={24} />
          </a>
          <a
            href="https://tiktok.com/@Click_Alternativo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
          >
            <SiTiktok size={24} />
          </a>
        </div>
        <a
          href="https://instagram.com/Click_Alternativo"
          target="_blank"
          rel="noopener noreferrer"
          class="social-handle"
        >
          @Click_Alternativo
        </a>
      </div>

      {/* COLUMNA CENTRAL: INFO Y COPYRIGHT */}
      <div class="footer-column footer-info">
        <p class="copyright">
          Copyright © {currentYear} Click Alternativo 
        </p>
        <p class="copyright">Todos los derechos reservados.</p>
      </div>

      {/* COLUMNA DERECHA: APOYO */}
      <div class="footer-column footer-support">
        <p>¿Te gusta nuestro trabajo?</p>
        <A href="/apoyanos" class="support-button">¡APOYANOS!</A>
      </div>
    </footer>
  );
}