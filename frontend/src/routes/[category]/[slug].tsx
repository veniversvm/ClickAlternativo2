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
  
  // 1. Cargamos los datos de la categoría
  const data = createAsync(() => blogApi.getPaginated(params.category));

  // 2. Determinamos el estado de forma explícita para evitar carreras
  const status = createMemo(() => {
    const res = data();
    if (res === undefined) return "loading";
    // Si no hay resultados o la API dio error, es un 404 real
    if (!res || res.error || (res.results && res.results.length === 0)) return "404";
    return "success";
  });

  const pageTitle = createMemo(() =>
    params.category
      ? params.category.charAt(0).toUpperCase() + params.category.slice(1)
      : ""
  );

  return (
    // Ponemos un título de carga en el Suspense para que Google no vea un 404 de entrada
    <Suspense fallback={<Title>Cargando {pageTitle()}... | Click Alternativo</Title>}>
      
      {/* 
          ESTADO 1: Mientras carga, NO renderizamos el NotFound.
          Esto evita que el título "404" se cuele en el head.
      */}
      <Show 
        when={status() !== "loading"} 
        fallback={<div class="page-loader">Buscando en la sección {pageTitle()}...</div>}
      >
        
        {/* 
            ESTADO 2: Si terminó de cargar, decidimos entre Éxito o 404 
        */}
        <Show 
          when={status() === "success"} 
          fallback={
            <NotFound message={`La sección "${params.category}" no cuenta con curadurías actualmente.`} />
          }
        >
          {/* SEO: Solo se inyecta cuando estamos 100% seguros de que hay datos */}
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

            <SearchResults
              results={data()?.results}
              error={data()?.error}
            />
          </main>
        </Show>
      </Show>
    </Suspense>
  );
}