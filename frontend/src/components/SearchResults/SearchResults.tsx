import { For, Show } from "solid-js";
import PostCard from "../PostCard/PostCard";

interface Props {
  results?: any[];
  error?: boolean;
}

export default function SearchResults(props: Props) {
  return (
    <div class="search-results-container">
      {/* Error de API — la red falló */}
      <Show when={props.error}>
        <div class="api-down-message">
          <p>Estamos teniendo problemas para conectar con nuestra base de datos.</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </Show>

      {/* Sin error pero sin resultados */}
      <Show when={!props.error && props.results?.length === 0}>
        <p class="no-results">No hay curadurías disponibles hoy.</p>
      </Show>

      {/* Resultados normales */}
      <Show when={!props.error && (props.results?.length ?? 0) > 0}>
        <div class="posts-grid">
          <For each={props.results}>
            {(post) => <PostCard {...post} />}
          </For>
        </div>
      </Show>
    </div>
  );
}