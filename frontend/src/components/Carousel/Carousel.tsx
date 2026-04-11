import { createSignal, onMount, onCleanup, For, Show } from "solid-js";
import "./carousel.scss"; // Mueve tus estilos aquí

interface CarouselProps {
  images: string[]; // URLs de tu API de Go
}

export default function Carousel(props: CarouselProps) {
  const [currentIndex, setCurrentIndex] = createSignal(0);
  let timer: number;

  const totalSlides = () => props.images.length;

  // Lógica de navegación
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % totalSlides());
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + totalSlides()) % totalSlides());
  const goToSlide = (index: number) => {
    stopAutoSlide();
    setCurrentIndex(index);
    startAutoSlide();
  };

  // Lógica de Auto-slide (Efecto de ciclo de vida)
  const startAutoSlide = () => {
    timer = window.setInterval(nextSlide, 10000); // 10 segundos
  };

  const stopAutoSlide = () => clearInterval(timer);

  onMount(() => {
    if (totalSlides() > 1) startAutoSlide();
  });

  onCleanup(() => stopAutoSlide());

  return (
    <div class="carousel-container" aria-roledescription="carousel">
      <div class="carousel-slides">
        <For each={props.images}>
          {(img, i) => (
            <div 
              class="carousel-slide" 
              classList={{ active: currentIndex() === i() }}
            >
              <img
                src={img}
                alt={`Imagen ${i() + 1}`}
                // Optimización SEO/LCP: La primera imagen carga de inmediato
                loading={i() === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          )}
        </For>
      </div>

      {/* Solo mostramos controles si hay más de una imagen */}
      <Show when={totalSlides() > 1}>
        <button class="carousel-button prev" onClick={prevSlide} aria-label="Anterior">‹</button>
        <button class="carousel-button next" onClick={nextSlide} aria-label="Siguiente">›</button>

        <div class="carousel-dots">
          <For each={props.images}>
            {(_, i) => (
              <button
                class="dot"
                classList={{ active: currentIndex() === i() }}
                onClick={() => goToSlide(i())}
                aria-label={`Ir a imagen ${i() + 1}`}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}