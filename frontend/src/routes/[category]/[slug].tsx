import { createAsync, useParams, A } from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { For, Show, Suspense, createMemo } from "solid-js";
import { blogApi } from "~/lib/api";
import Carousel from "~/components/Carousel/Carousel";
import { marked } from "marked";
import NotFound from "~/components/Common/NotFound";
import "~/styles/blogpost.scss";

export default function PostDetailPage() {
  const params = useParams();
  
  // 1. Petición asíncrona
  const post = createAsync(() => blogApi.getBySlug(params.slug ?? ""));

  // 2. Memoizamos las imágenes (Safe check para post())
  const postImages = createMemo(() => {
    const data = post();
    if (!data || data.error) return [];
    return [data.image_url1, data.image_url2, data.image_url3].filter(Boolean) as string[];
  });

  // 3. Formateo de URL (Safe check para post())
  const displayUrl = createMemo(() => {
    try {
      const url = post()?.content_url;
      return url ? new URL(url).hostname.replace(/^www\./, "") : "";
    } catch { return ""; }
  });

  // 4. Formateo de Fecha
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Reciente";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "Reciente" : d.toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  // 5. Renderizado de Markdown (Safe check para post())
  const renderedContent = createMemo(() => {
    const content = post()?.content;
    if (!content) return "";
    return marked.parse(content);
  });

  return (
    // Suspense maneja el estado de carga (mientras post() es undefined)
    <Suspense fallback={<div class="page-loader">Cargando curaduría...</div>}>
      <Show 
        when={post() && !post().error} 
        fallback={
          /* 
             Si post() devuelve null o el objeto tiene un flag de error,
             lanzamos el componente NotFound que ya tiene HttpStatusCode 404.
          */
          <NotFound message={`La curaduría "${params.slug}" no existe o ha sido movida.`} />
        }
      >
        <article class="blog-post-container">
          {/* SEO DINÁMICO */}
          <Title>{post()!.title} | Click Alternativo</Title>
          <Meta name="description" content={post()!.description} />
          <Link rel="canonical" href={`https://clickalternativo.com/${params.category}/${post()!.slug}`} />

          <div class="post-detail-layout">
            <div class="post-visual-side">
              <Carousel images={postImages()} />
              <div class="navigation-wrapper-simple">
                <a 
                  href={post()!.content_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="visit-button-full"
                >
                  VISITAR {displayUrl().toUpperCase()}
                </a>
              </div>
            </div>

            <div class="post-info-side">
              <header class="post-header">
                <h1 class="post-title">{post()!.title}</h1>
                <p class="post-date">Curado el {formatDate(post()!.created_at)}</p>
              </header>

              <div class="post-description-lead">
                <p>{post()!.description}</p>
              </div>

              <Show when={post()!.content}>
                <div 
                  class="post-main-content" 
                  innerHTML={renderedContent() as string} 
                />
              </Show>

              <Show when={post()!.categories?.length > 0}>
                <div class="tags-section">
                  <h3 class="tags-title">RELEVANCIA</h3>
                  <div class="tags-container-flex">
                    <For each={post()!.categories}>
                      {(cat) => (
                        <A href={`/${cat.slug}`} class="tag-pill">
                          {cat.name.toUpperCase()}
                        </A>
                      )}
                    </For>
                  </div>
                </div>
              </Show>
            </div>
          </div>
        </article>
      </Show>
    </Suspense>
  );
}