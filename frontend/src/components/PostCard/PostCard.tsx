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
  // Manejo de fecha para evitar "Invalid Date"
  const date = () => {
    const d = new Date(props.CreatedAt);
    return isNaN(d.getTime()) ? "Reciente" : d.toLocaleDateString();
  };

  // El backend envía image_url1 (según tu Select en Go)
  const image = () => props.image_url_1 ?? undefined;

  // Construcción de la URL: /categoria/slug
  const category = () => props.categories?.[0]?.slug || "blog";

  return (
    <div class="post-card">
      <A href={`/${category()}/${props.slug}`} class="card-image-link">
        <Show when={image()} fallback={<div class="image-placeholder" />}>
          <img src={image()} alt={props.title} class="card-image" loading="lazy" />
        </Show>
      </A>
      <div class="card-content">
        <A href={`/${category()}/${props.slug}`} class="card-title-link">
          <h2>{props.title}</h2>
        </A>
        <p>{props.description}</p>
        <time>{date()}</time>
      </div>
    </div>
  );
}