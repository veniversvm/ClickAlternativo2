import { useSearchParams, createAsync } from "@solidjs/router";
import { Suspense } from "solid-js";
import { blogApi } from "~/lib/api";
import SearchResults from "~/components/SearchResults/SearchResults";

export default function SearchPage() {
  const [searchParams] = useSearchParams();

  // Cada vez que la URL cambie (ej: ?search=musica), esto se re-ejecuta
  const searchQuery = Array.isArray(searchParams.search) 
    ? searchParams.search[0] 
    : searchParams.search ?? "";
  
  const data = createAsync(() => 
    blogApi.getPaginated("", 1, searchQuery)
  );

  return (
    <main class="container mx-auto p-4">
      <h1 class="text-2xl mb-6">
        Resultados para: <span class="text-primary">{searchParams.search}</span>
      </h1>

      <Suspense fallback={<p>Buscando...</p>}>
        <SearchResults 
          results={data()?.results} 
          error={data()?.error} 
        />
      </Suspense>
    </main>
  );
}