import { createAsync } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
import { Suspense } from "solid-js";
import { blogApi } from "~/lib/api";
import SearchResults from "~/components/SearchResults/SearchResults";
import { Search } from "~/components/SearchBar/SearchBar";
import "./category-view.scss"

interface CategoryViewProps {
  category: string;
  displayTitle: string;
  description: string;
}

export default function CategoryView(props: CategoryViewProps) {
  // Petición de datos específica para esta categoría
  const data = createAsync(() => blogApi.getPaginated(props.category));

  return (
    <main class="section-container">
      {/* SEO Estático: Google y WhatsApp lo leerán al instante porque no depende de lógica dinámica */}
      <Title>{props.displayTitle} | Click Alternativo</Title>
      <Meta name="description" content={props.description} />
      <Meta property="og:title" content={`${props.displayTitle} | Click Alternativo`} />

      <header class="section-header">
        <h1 class="section-title">
          Sección: <span>{props.displayTitle}</span>
        </h1>
        <Search size="small" />
      </header>

      <Suspense fallback={<div class="page-loader">Cargando {props.displayTitle}...</div>}>
        <SearchResults
          results={data()?.results}
          error={data()?.error}
        />
      </Suspense>
    </main>
  );
}