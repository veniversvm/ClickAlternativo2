import { createSignal, createEffect, onMount, For, Show, Suspense } from "solid-js";
import { createAsync } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
import { blogApi } from "~/lib/api";
import Welcome from "~/components/Welcome/Welcome";
import PostCard from "~/components/PostCard/PostCard";
import "./index.scss"; // Asegúrate de crear este estilo o usar app.scss

export default function Home() {
  // 1. Estados para el scroll
  const [posts, setPosts] = createSignal<any[]>([]);
  const [page, setPage] = createSignal(1);
  const [hasMore, setHasMore] = createSignal(true);
  const [loadingMore, setLoadingMore] = createSignal(false);

  // 2. Carga inicial (SSR para Google)
  const initialData = createAsync(() => blogApi.getPaginated());

  // 3. Sincronizar datos iniciales cuando Bun los entrega al navegador
  createEffect(() => {
    const data = initialData();
    if (data && data.results) {
      setPosts(data.results);
      setPage(1);
      setHasMore(data.results.length === 20);
    }
  });

  // 4. Función para cargar más contenido
  const loadMore = async () => {
    if (loadingMore() || !hasMore()) return;
    
    setLoadingMore(true);
    const nextPage = page() + 1;
    
    const data = await blogApi.getPaginated("", nextPage);
    
    if (data && data.results) {
      if (data.results.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => [...prev, ...data.results]);
        setPage(nextPage);
        if (data.results.length < 20) setHasMore(false);
      }
    }
    setLoadingMore(false);
  };

  // 5. Configurar el observador del final de página
  let triggerRef: HTMLDivElement | undefined;
  
  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore()) {
        loadMore();
      }
    }, { threshold: 0.1 });

    if (triggerRef) observer.observe(triggerRef);
  });

  return (
    <>
      <Title>Inicio | Click Alternativo</Title>
      <Meta name="description" content="Contenido web curado por humanos con scroll infinito." />

      <Welcome />

      <section class="latest-feed container mx-auto p-4">
        <h2 class="text-2xl font-bold mb-8 border-b border-[#6BBF5B] pb-2">
          Explora el Catálogo
        </h2>

        {/* Renderizado de la grilla */}
        <div class="posts-grid">
          <For each={posts()}>
            {(post) => (
              <PostCard 
                slug={post.slug}
                title={post.title}
                description={post.description}
                image_url_1={post.image_url1 || post.image_url_1} 
                CreatedAt={post.created_at}
                categories={post.categories} // Enviamos el objeto completo como espera PostCard
              />
            )}
          </For>
        </div>

        {/* Elemento que dispara la carga al hacerse visible */}
        <div ref={triggerRef} class="infinite-loader-trigger">
          <Show when={loadingMore()}>
            <div class="loader-dots">
              <span></span><span></span><span></span>
            </div>
          </Show>
          <Show when={!hasMore() && posts().length > 0}>
            <p class="end-message">Has llegado al final de nuestra selección humana.</p>
          </Show>
        </div>
      </section>
    </>
  );
}