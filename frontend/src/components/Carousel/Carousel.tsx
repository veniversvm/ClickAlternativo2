import { createSignal, onMount, onCleanup, For, Show, createEffect } from "solid-js";
import "./Carousel.scss";

export default function Carousel(props: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = createSignal(0);
  let timer: any;

  const startAutoSlide = () => {
    stopAutoSlide();
    if (props.images.length > 1) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % props.images.length);
      }, 7000); // 7 segundos es mejor para lectura
    }
  };

  const stopAutoSlide = () => clearInterval(timer);

  // Reiniciar el carrusel si el usuario navega a otro post
  createEffect(() => {
    if (props.images.length) {
      setCurrentIndex(0);
      startAutoSlide();
    }
  });

  onCleanup(() => stopAutoSlide());

  return (
    <div class="carousel-container" onMouseEnter={stopAutoSlide} onMouseLeave={startAutoSlide}>
      <div class="carousel-slides">
        <For each={props.images}>
          {(img, i) => (
            <div class="carousel-slide" classList={{ active: currentIndex() === i() }}>
              <img src={img} alt="Curaduría" loading={i() === 0 ? "eager" : "lazy"} />
            </div>
          )}
        </For>
      </div>

      <Show when={props.images.length > 1}>
        <div class="carousel-dots">
          <For each={props.images}>
            {(_, i) => (
              <button 
                class="dot" 
                classList={{ active: currentIndex() === i() }} 
                onClick={() => setCurrentIndex(i())}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}