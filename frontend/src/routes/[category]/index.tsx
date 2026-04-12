import { createAsync, useParams } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
import { Suspense } from "solid-js";
import { blogApi } from "~/lib/api";
import SearchResults from "~/components/SearchResults/SearchResults";
import { Search } from "~/components/SearchBar/SearchBar";

export const config = { prerender: false, ssr: true };

export default function CategoryPage() {
  const params = useParams();
  const posts = createAsync(() => blogApi.getPaginated(params.category));

  const pageTitle = () =>
    params.category
      ? params.category.charAt(0).toUpperCase() + params.category.slice(1)
      : "";

  return (
    <>
      <Title>{pageTitle()} | Click Alternativo</Title>
      <Meta
        name="description"
        content={`Todas las entradas sobre ${pageTitle()} en Click Alternativo.`}
      />

      <div class="section-container">
        <h1 class="section-title">
          Artículos sobre: <span>{pageTitle()}</span>
        </h1>
        <Search size="small" />

        <Suspense fallback={<p class="page-loader">Cargando...</p>}>
          <SearchResults
            results={posts()?.results}
            error={posts()?.error}
          />
        </Suspense>
      </div>
    </>
  );
}