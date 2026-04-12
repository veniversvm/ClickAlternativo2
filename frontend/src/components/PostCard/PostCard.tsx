import { Show } from "solid-js";
import { A } from "@solidjs/router";
import "./PostCard.scss";

interface PostCardProps {
  slug: string;
  title: string;
  description: string;
  image_url_1?: string | null;
  CreatedAt: string;
  content_url?: string | null;
  categories?: { id: number; name: string; slug: string; type: string }[];
}

export default function PostCard(props: PostCardProps) {
  console.log(props)
  const formattedDate = () =>
    new Date(props.CreatedAt).toLocaleDateString("es-ES", {
      year: "numeric", month: "long", day: "numeric",
    });

  // Tomar la primera categoría primaria para construir la URL
  const primaryCategory = () =>
    props.categories?.find((c) => c.type === "primary")?.slug
    ?? props.categories?.[0]?.slug
    ?? "blog";

  const detailUrl = () => `/${primaryCategory()}/${props.slug}`;

  return (
    <div class="post-card">
      <A href={detailUrl()} class="card-image-link" aria-label={`Leer más sobre ${props.title}`}>
        <Show when={props.image_url_1} fallback={<div class="image-placeholder" />}>
          <img
            src={props.image_url_1!}
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
        <time datetime={props.CreatedAt}>{formattedDate()}</time>
        <Show when={props.content_url}>
          <div class="external-link-wrapper">
            <a href={props.content_url!} class="external-button" target="_blank" rel="noopener noreferrer">
              Visitar Página →
            </a>
          </div>
        </Show>
      </div>
    </div>
  );
}