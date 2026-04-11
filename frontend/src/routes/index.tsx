// src/routes/index.tsx
import { Title, Meta } from "@solidjs/meta";
import { Suspense } from "solid-js";
import { createAsync } from "@solidjs/router";
import { fetchEntries } from "~/lib/api";
import Welcome from "~/components/Welcome/Welcome";
import SearchResults from "~/components/SearchResults/SearchResults";

export default function Home() {
  // Iniciamos la carga de los últimos posts (SSR)
  // Esto hará que Google vea contenido real en la Home desde el primer segundo
  const latestPosts = createAsync(() => fetchEntries());

  return (
    <>
      {/* SEO Específico para la Home */}
      <Title>Inicio | Click Alternativo</Title>
      <Meta 
        name="description" 
        content="Página de inicio de Click Alternativo. Descubre la web de una nueva manera con contenido curado por humanos." 
      />

      {/* Componente principal de bienvenida (Logo + Buscador) */}
      <Welcome />

      {/* 
         Opcional: Feed de últimas publicaciones debajo del Welcome.
         Añadir esto mejora mucho el SEO porque Google encuentra enlaces
         internos nada más entrar.
      */}
      <section class="latest-feed container mx-auto p-4">
        <h2 class="text-2xl font-bold mb-6 border-b border-[#6BBF5B] pb-2">
          Últimas Curadurías
        </h2>
        
        <Suspense fallback={<p class="text-center">Cargando sugerencias...</p>}>
          <SearchResults results={latestPosts()?.results} />
        </Suspense>
      </section>
    </>
  );
}