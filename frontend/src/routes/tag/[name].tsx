import { createAsync, useParams } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
import { Show, Suspense, createMemo } from "solid-js";
import { blogApi } from "~/lib/api";
import SearchResults from "~/components/SearchResults/SearchResults";
import { Search } from "~/components/SearchBar/SearchBar";
import NotFound from "~/components/Common/NotFound";

export const config = { prerender: false, ssr: true };

export default function CategoryPage() {
  const params = useParams();

  // 1. Petición única
  const data = createAsync(() => blogApi.getPaginated(params.category));

  const pageTitle = createMemo(() =>
    params.category
      ? params.category.charAt(0).toUpperCase() + params.category.slice(1)
      : ""
  );

  return (
    // El Suspense atrapa el estado 'undefined' de createAsync automáticamente
    <Suspense fallback={<div class="page-loader">Cargando...</div>}>
      <Show
        when={data() && data()!.total > 0}
        fallback={
          /* 
             Si llegamos aquí es porque data() ya no es undefined (ya cargó) 
             y el total es 0 o hubo un error.
          */
          <NotFound
            message={`La sección "${params.category}" no cuenta con curadurías actualmente.`}
          />
        }
      >
        {/* SEO: Solo se inyecta si el 'when' es verdadero */}
        <Title>{pageTitle()} | Click Alternativo</Title>
        <Meta
          name="description"
          content={`Explora todas las curadurías sobre ${pageTitle()} seleccionadas a mano.`}
        />

        <main class="section-container">
          <header class="section-header">
            <h1 class="section-title">
              Sección: <span>{pageTitle()}</span>
            </h1>
            <Search size="small" />
          </header>

          <SearchResults results={data()?.results} error={data()?.error} />
        </main>
      </Show>
    </Suspense>
  );
}