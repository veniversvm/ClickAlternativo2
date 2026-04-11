import "./AboutUs.scss";

export const AboutUs = () => {
  return (
    <>
      <section id="about-us-section">
        <header class="about-us-header">
          <h1 class="about-us-title">
            Sobre Nosotros <br /> Click Alternativo
          </h1>
          <p class="about-us-intro">
            Click Alternativo es un buscador diferente que prioriza calidad
            sobre cantidad. Nuestro objetivo es filtrar el ruido digital para
            que encuentres información realmente útil, verificada y bien
            descrita.
          </p>
        </header>

        <article class="about-us-article">
          <h2 class="about-us-subtitle">¿Quiénes Somos?</h2>
          <p class="about-us-text">
            Nuestro equpio es apasionado por la curación de contenido web. En un
            internet saturado de resultados irrelevantes, anuncios invasivos,
            resultados frios de la IA, ofrecemos una alternativa: un espacio
            donde cada enlace ha sido seleccionado y validado por personas
            reales.
          </p>
          <p class="about-us-text">
            No creemos en algoritmos masivos que priorizan la cantidad sobre la
            calidad. Creemos en un internet más humano, donde la exploración
            digital sea un viaje con propósito y cada clic te lleve a un recurso
            valioso.
          </p>
        </article>

        <article class="about-us-article">
          <h2 class="about-us-subtitle">¿Cómo Lo Hacemos?</h2>

          <div class="about-us-step">
            <h3 class="about-us-heading3">1. Selección Manual</h3>
            <p class="about-us-text">
              En lugar de depender de rastreadores automáticos, revisamos cada
              sitio web de forma individual, asegurándonos de que cumpla
              nuestros criterios de utilidad, seguridad y relevancia.
            </p>
          </div>

          <div class="about-us-step">
            <h3 class="about-us-heading3">2. Revisión en 3 Pasos</h3>
            <ul class="about-us-list">
              <li class="about-us-item">
                <span class="highlight-success">Análisis</span>: nuestro equipo
                evalúa la calidad, seguridad y relevancia de cada sitio.
              </li>
              <li class="about-us-item">
                <span class="highlight-success">Categorización temática</span>:
                organizamos los sitios por temas y subtemas para facilitar tu
                búsqueda.
              </li>
              <li class="about-us-item">
                <span class="highlight-success">Descripción humana</span>:
                redactamos resúmenes claros y precisos que explican el valor de
                cada recurso.
              </li>
            </ul>
          </div>

          <div class="about-us-step">
            <h3 class="about-us-heading3">3. Base de Datos Limitada</h3>
            <p class="about-us-text">
              Preferimos{" "}
              <span class="highlight-success">100 sitios excelentes</span> a
              10,000 irrelevantes. Cada recurso que agregamos pasa un estricto
              filtro de calidad.
            </p>
          </div>

          <div class="about-us-step">
            <h3 class="about-us-heading3">4. Actualización Diaria</h3>
            <p class="about-us-text">
              Agregamos nuevas recomendaciones cada día, manteniendo nuestra
              base de datos siempre fresca y confiable.
            </p>
          </div>
        </article>

        <article class="about-us-article">
          <h2 class="about-us-subtitle">¿Por Qué Elegirnos?</h2>
          <ul class="about-us-list">
            <li class="about-us-item">
              Contenido 100% curado por personas reales.
            </li>
            <li class="about-us-item">
              Sin spam, publicidad engañosa ni resultados duplicados.
            </li>
            <li class="about-us-item">
              Enfoque en la calidad, relevancia y seguridad de la información.
            </li>
            <li class="about-us-item">
              Ideal para investigadores, estudiantes, periodistas y usuarios que
              valoran el tiempo.
            </li>
          </ul>
        </article>

        <footer class="about-us-footer">
          <p>
            ClickAlternativo — Tu puerta a un internet más limpio, útil y
            humano.
          </p>
        </footer>
      </section>
    </>
  );
};
