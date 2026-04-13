import { For, Show } from "solid-js";
import PostCard from "../PostCard/PostCard";

interface Props {
  results?: any[];
  error?: boolean;
}

export default function SearchResults(props: Props) {
  return (
    <div class="search-results-container">
      {/* 1. API Caída */}
      <Show when={props.error}>
        <div class="api-down-message">
          <p>La conexión con el catálogo se ha interrumpido.</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </Show>

      {/* 2. Sin resultados (Solo si terminó de cargar y no hubo error) */}
      <Show when={!props.error && props.results && props.results.length === 0}>
        <p class="no-results">No hay curadurías disponibles hoy.</p>
      </Show>

      {/* 3. Resultados: MAPEO MANUAL DE CAMPOS (Crítico) */}
      <Show when={(props.results?.length ?? 0) > 0}>
        <div class="posts-grid">
          <For each={props.results}>
            {(post) => (
              <PostCard 
                slug={post.slug}
                title={post.title}
                description={post.description}
                // Aseguramos que use el nombre que viene de Go (image_url1)
                image_url_1={post.image_url1 || post.image_url_1} 
                CreatedAt={post.created_at}
                // Extraemos el slug de la primera categoría para la URL
                categories={post.categories?.[0]?.slug || "blog"}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}