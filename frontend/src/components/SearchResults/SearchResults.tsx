import { For, Show } from "solid-js";
import PostCard from "../PostCard/PostCard";
import "./SearchResults.scss";

interface SearchResultsProps {
  results: any[]; // El array que viene de tu API de Go
  loading?: boolean;
}

export default function SearchResults(props: SearchResultsProps) {
  return (
    <div class="search-results-container">
      <Show 
        when={props.results && props.results.length > 0} 
        fallback={
          <Show when={!props.loading}>
            <p class="no-results">
              No se encontraron artículos para tu búsqueda. ¡Intenta con otras palabras!
            </p>
          </Show>
        }
      >
        <div class="posts-grid">
          <For each={props.results}>
            {(post) => (
              <PostCard 
                slug={post.slug}
                title={post.title}
                description={post.description}
                image_url1={post.image_url_1}
                created_at={post.created_at}
                content_url={post.content_url}
                category={post.categories?.[0]?.slug}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}