// src/routes/[category]/index.tsx
import { createAsync, useParams } from "@solidjs/router";
import { fetchEntries } from "~/lib/api";
import { For, Show } from "solid-js";
import { Title, Meta } from "@solidjs/meta";

export default function CategoryPage() {
  const params = useParams();
  
  // Obtenemos los posts filtrados por la categoría de la URL
  const data = createAsync(() => fetchEntries(params.category));

  return (
    <div class="section-container">
      <Title>{(params.category ?? '').toUpperCase()} | Click Alternativo</Title>
      <Meta name="description" content={`Explora lo mejor de ${params.category} curado por expertos.`} />

      <h1 class="section-title">Sección: {params.category ?? 'Unknown'}</h1>

      <div class="posts-grid">
        <For each={data()?.results}>
          {(post) => (
            <div class="post-card">
               {/* Reutilizamos tus clases de postcard.scss */}
               <img src={post.image_url_1} class="card-image" />
               <div class="card-content">
                  <a href={`/${params.category ?? ''}/${post.slug}`}>
                    <h2>{post.title}</h2>
                  </a>
                  <p>{post.description}</p>
               </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}