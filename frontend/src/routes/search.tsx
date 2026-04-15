import { createSignal, createEffect, onMount, For, Show, Suspense, createMemo } from "solid-js";
import { createAsync, useSearchParams } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
import { blogApi } from "~/lib/api";
import Welcome from "~/components/Welcome/Welcome";
import PostCard from "~/components/PostCard/PostCard";
import "./index.scss";
import { Search } from "~/components/SearchBar/SearchBar";

export default function Home() {
  const [searchParams] = useSearchParams();
  
  // 1. Estados para el scroll y paginación
  const [posts, setPosts] = createSignal<any[]>([]);
  const [page, setPage] = createSignal(1);
  const [hasMore, setHasMore] = createSignal(true);
  const [loadingMore, setLoadingMore] = createSignal(false);

  // 2. Extraer y normalizar el término de búsqueda de la URL (?search=...)
  const searchTerm = createMemo(() => {
    const s = searchParams.search;
    return (Array.isArray(s) ? s[0] : s) || "";
  });

  // 3. Carga inicial (SSR): Se dispara cada vez que searchTerm cambia
  const initialData = createAsync(() => 
    blogApi.getPaginated("", 1, searchTerm())
  );

  // 4. Sincronización: Cuando initialData cambia (por nueva búsqueda o carga inicial)
  createEffect(() => {
    const data = initialData();
    if (data && !data.error) {
      // RESET: Al ser una búsqueda nueva o carga inicial, reemplazamos los posts
      setPosts(data.results || []);
      setPage(1);
      setHasMore((data.results?.length || 0) >= 20);
    }
  });

  // 5. Función para cargar más contenido (Scroll Infinito)
  const loadMore = async () => {
    if (loadingMore() || !hasMore()) return;
    
    setLoadingMore(true);
    const nextPage = page() + 1;
    
    // IMPORTANTE: Mantenemos el searchTerm en la paginación
    const data = await blogApi.getPaginated("", nextPage, searchTerm());
    
    if (data && data.results) {
      if (data.results.length === 0) {
        setHasMore(false);
      } else {
        // APPEND: Aquí sí acumulamos los resultados
        setPosts(prev => [...prev, ...data.results]);
        setPage(nextPage);
        // Si recibimos menos del límite, ya no hay más
        if (data.results.length < 20) setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  // 6. Configurar el observador del final de página
  let triggerRef: HTMLDivElement | undefined;
  
  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      // Si el elemento es visible y no estamos ya cargando, pedimos más
      if (entries[0].isIntersecting && hasMore() && !loadingMore()) {
        loadMore();
      }
    }, { 
      threshold: 0.1,
      rootMargin: "200px" // Empezamos a cargar 200px antes de llegar al final para mejor UX
    });

    if (triggerRef) observer.observe(triggerRef);
  });

  return (
    <>
      <Title>Inicio | Click Alternativo</Title>
      <Meta name="description" content="Contenido web curado por humanos con scroll infinito y búsqueda reactiva." />

      <Search size="small" />

      <section class="latest-feed container mx-auto p-4">
        {/* Indicador de búsqueda activa */}
        <Show when={searchTerm()}>
          <h2 class="text-xl mb-6">
            Resultados para: <span class="text-primary" style={{ color: "#6BBF5B" }}>{searchTerm()}</span>
          </h2>
        </Show>

        <Show when={!searchTerm()}>
          <h2 class="text-2xl font-bold mb-8 border-b border-[#6BBF5B] pb-2">
            Explora el Catálogo
          </h2>
        </Show>

        {/* Renderizado de la grilla de posts */}
        <div class="posts-grid">
          <For each={posts()}>
            {(post) => (
              <PostCard 
                slug={post.slug}
                title={post.title}
                description={post.description}
                // Manejo de nombres de campos según el log de Go (image_url1)
                image_url_1={post.image_url1 || post.image_url_1} 
                CreatedAt={post.created_at}
                categories={post.categories} 
              />
            )}
          </For>
        </div>

        {/* Elemento disparador (Trigger) */}
        <div ref={triggerRef} class="infinite-loader-trigger" style={{ "min-height": "100px", display: "flex", "justify-content": "center", "align-items": "center" }}>
          <Show when={loadingMore()}>
            <div class="loader-dots">
              <span></span><span></span><span></span>
            </div>
          </Show>
          
          <Show when={!hasMore() && posts().length > 0}>
            <p class="end-message" style={{ color: "#666", "font-style": "italic" }}>
              Has llegado al final de nuestra selección humana.
            </p>
          </Show>

          <Show when={!loadingMore() && posts().length === 0 && !initialData()?.error}>
            <p class="end-message">No se encontraron resultados para "{searchTerm()}".</p>
          </Show>
        </div>
      </section>
    </>
  );
}