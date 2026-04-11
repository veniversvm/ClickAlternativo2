import "./AboutUs.scss";

export const AboutUsComponent = () => {
  return (
    <section id="about-us-section" class="about-us-container">
      <header class="about-us-header">
        <h1 class="about-us-title">
          Sobre Nosotros <br /> 
          <span class="text-highlight">Click Alternativo</span>
        </h1>
        <p class="about-us-intro">
          Click Alternativo es un proyecto de <strong>curaduría de contenido web</strong> que prioriza la calidad
          sobre la cantidad. Filtramos el ruido digital para que encuentres información útil, 
          verificada y con criterio humano.
        </p>
      </header>

      <article class="about-us-article">
        <h2 class="about-us-subtitle">¿Quiénes Somos?</h2>
        <p class="about-us-text">
          Nuestro equipo es apasionado por la <strong>curación de contenido</strong>. En un
          internet saturado de resultados irrelevantes, anuncios invasivos y respuestas frías de la IA, 
          ofrecemos un espacio donde cada enlace ha sido seleccionado y validado por personas reales.
        </p>
        <p class="about-us-text">
          Creemos en un internet más humano, donde la exploración
          digital sea un viaje con propósito y cada clic te lleve a un recurso valioso.
        </p>
      </article>

      <article class="about-us-article">
        <h2 class="about-us-subtitle">Metodología de Curaduría</h2>

        <div class="about-us-step">
          <h3 class="about-us-heading3">1. Selección Manual de Enlaces</h3>
          <p class="about-us-text">
            Revisamos cada sitio web de forma individual. No usamos bots ciegos; 
            evaluamos la utilidad, seguridad y relevancia de cada recurso antes de listarlo.
          </p>
        </div>

        <div class="about-us-step">
          <h3 class="about-us-heading3">2. Revisión de Calidad en 3 Pasos</h3>
          <ul class="about-us-list">
            <li class="about-us-item">
              <strong class="highlight-success">Análisis Crítico:</strong> Evaluación de la fuente y veracidad.
            </li>
            <li class="about-us-item">
              <strong class="highlight-success">Categorización Inteligente:</strong> Organización temática para facilitar la búsqueda.
            </li>
            <li class="about-us-item">
              <strong class="highlight-success">Resumen Humano:</strong> Redactamos descripciones claras que aportan valor inmediato.
            </li>
          </ul>
        </div>

        <div class="about-us-step">
          <h3 class="about-us-heading3">3. Base de Datos de Alta Relevancia</h3>
          <p class="about-us-text">
            Preferimos <strong>100 sitios excelentes</strong> antes que 10,000 resultados irrelevantes. 
            Calidad garantizada mediante filtros estrictos.
          </p>
        </div>
      </article>

      <article class="about-us-article">
        <h2 class="about-us-subtitle">¿Por qué usar Click Alternativo?</h2>
        <ul class="about-us-list">
          <li class="about-us-item">Contenido 100% verificado por humanos.</li>
          <li class="about-us-item">Navegación libre de spam y publicidad engañosa.</li>
          <li class="about-us-item">Ahorro de tiempo para investigadores, estudiantes y profesionales.</li>
          <li class="about-us-item">Enfoque en la seguridad digital del usuario.</li>
        </ul>
      </article>

      <footer class="about-us-footer">
        <p>
          Click Alternativo — Tu puerta a un internet más limpio, útil y humano.
        </p>
      </footer>
    </section>
  );
};