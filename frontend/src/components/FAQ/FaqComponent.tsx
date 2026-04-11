import "./FaqComponent.scss";

export const FAQComponent = () => {
  return (

    <section id="section-faq" class="section-faq">
    <header class="section-faq__header">
      <h1 class="section-faq__title">
        FAQ
        <br />
        Preguntas Frecuentes de Click Alternativo
      </h1>
      <p class="section-faq__intro">
        Encuentra respuestas claras y rápidas sobre cómo funciona
        <span class="text-highlight"> Click Alternativo</span>,  que prioriza la calidad sobre la cantidad, lo humano sobre
        el algoritmo.
      </p>
    </header>

    <div class="section-faq__container">
      <article class="section-faq__item" id="faq-item-que-es">
        <h2 class="section-faq__question">¿Qué es Click Alternativo?</h2>
        <p class="section-faq__answer">
          Es un <span class="text-highlight">catálogo web manual</span> con
          <span class="text-highlight"> motor de búsqueda propio </span>. Cada
          resultado es{" "}
          <span class="text-highlight">
            añadido, revisado, analizado y categorizado
          </span> por nuestro equipo humano, garantizando que recibas solo contenido
          útil y confiable.
        </p>
      </article>

      <article class="section-faq__item" id="faq-item-por-que">
        <h2 class="section-faq__question">¿Por qué hacemos esto?</h2>
        <p class="section-faq__answer">
          Para devolverle al usuario el control en una web cada vez más
          saturada. En un entorno digital lleno de ruido y publicidad intrusiva,
          ofrecemos una
          <span class="text-highlight">
            alternativa organizada y sin distracciones
          </span>
          . Nuestro objetivo es que encuentres{" "}
          <span class="text-highlight">información rápida y verificada</span>.
        </p>
      </article>

      <article class="section-faq__item" id="faq-item-pocos-resultados">
        <h2 class="section-faq__question">¿Por qué hay pocos resultados?</h2>
        <p class="section-faq__answer">
          Click Alternativo es más un{" "}
          <span class="text-highlight">catálogo seleccionado</span>
          que un motor de búsqueda tradicional. Usamos una
          <span class="text-highlight">
            base de datos propia actualizada manualmente
          </span>
          por nuestro equipo, lo que asegura calidad pero limita la cantidad de
          resultados.
          <br />
          Si no encuentras lo que buscas, puedes
          <span class="text-highlight">sugerir páginas</span> a través de
          nuestro panel de “Contacto”. Revisamos todas las propuestas y añadimos
          las que cumplen nuestros criterios.
        </p>
      </article>

      <article class="section-faq__item" id="faq-item-como-apoyar">
        <h2 class="section-faq__question">¿Cómo puedo apoyar?</h2>
        <p class="section-faq__answer">
          Puedes ayudarnos uniéndote a nuestra comunidad en Patreon y acceder a
          <span class="text-highlight">contenido exclusivo</span> mientras nos
          apoyas directamente. También puedes{" "}
          <span class="text-highlight">compartir Click Alternativo</span> en
          redes sociales, comunidades y con amigos. Cada difusión nos ayuda a
          crecer.
          <br />
          Además, si conoces una página o herramienta útil que no esté en
          nuestro catálogo,
          <span class="text-highlight">envíanos tu sugerencia</span> desde el
          panel de “Contacto”.
        </p>
      </article>
    </div>
  </section>
  )
};
