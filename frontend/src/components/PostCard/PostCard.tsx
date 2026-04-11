import { Show } from "solid-js";
import { A } from "@solidjs/router";
import "./PostCard.scss"; // Importamos tus estilos SCSS reciclados

interface PostCardProps {
  slug: string;
  title: string;
  description: string;
  image_url1?: string | null;
  created_at: string;
  content_url?: string | null;
  category?: string; // Para construir la URL dinámica /seccion/slug
}

export default function PostCard(props: PostCardProps) {
  // Formateo de fecha reactivo
  const formattedDate = () => {
    return new Date(props.created_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Construimos la URL interna. Si no hay categoría, usamos 'blog' por defecto
  const detailUrl = () => `/${props.category || 'blog'}/${props.slug}`;

  return (
    <div class="post-card">
      <A href={detailUrl()} class="card-image-link" aria-label={`Leer más sobre ${props.title}`}>
        <Show 
          when={props.image_url1} 
          fallback={<div class="image-placeholder"></div>}
        >
          <img
            src={props.image_url1!}
            alt={`Imagen de portada para ${props.title}`}
            class="card-image"
            loading="lazy"
            decoding="async"
          />
        </Show>
      </A>

      <div class="card-content">
        <A href={detailUrl()} class="card-title-link">
          <h2>{props.title}</h2>
        </A>
        
        <p>{props.description}</p>
        
        <time datetime={props.created_at}>
          {formattedDate()}
        </time>

        <Show when={props.content_url}>
          <div class="external-link-wrapper">
            <a 
              href={props.content_url!} 
              class="external-button" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Visitar Página →
            </a>
          </div>
        </Show>
      </div>
    </div>
  );
}