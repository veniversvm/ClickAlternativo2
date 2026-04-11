// src/routes/index.tsx
import { Suspense } from "solid-js";
import { createAsync } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
import { blogApi } from "~/lib/api";
import Welcome from "~/components/Welcome/Welcome";
import SearchResults from "~/components/SearchResults/SearchResults";

export default function Home() {
  // 1. Iniciamos la petición a Go lo antes posible.
  // SolidStart ejecutará esto en el servidor (SSR).
  const latestPosts = createAsync(() => blogApi.getPaginated());

  return (
    <>
      <Title>Inicio | Click Alternativo</Title>
      <Meta name="description" content="Contenido web curado por humanos." />

      {/* 
         2. CARGA INMEDIATA: 
         El componente Welcome no depende de datos, así que se renderiza 
         y se envía al navegador al instante (0ms).
      */}
      <Welcome />

      <section class="latest-feed container mx-auto p-4">
        {/* 
           3. CARGA DIFERIDA (Streaming):
           El navegador mostrará el fallback mientras Bun termina de recibir 
           los datos de Go e inyecta los resultados en el mismo HTML.
        */}
        <Suspense 
          fallback={
            <div class="loading-skeleton-container">
              <p>Conectando con el catálogo...</p>
              {/* Aquí puedes poner cuadritos grises */}
            </div>
          }
        >
          <SearchResults 
            results={latestPosts()?.results} 
            error={latestPosts()?.error} 
          />
        </Suspense>
      </section>
    </>
  );
}