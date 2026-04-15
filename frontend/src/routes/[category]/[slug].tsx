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
  
  // 1. Cargamos el post (SSR)
  const post = createAsync(() => blogApi.getBySlug(params.slug ?? ""));

  // 2. CORRECCIÓN: Mapeo de imágenes con nombres exactos (image_url_1)
  const postImages = createMemo(() => {
    const d = post();
    if (!d || d.error) return [];
    // Usamos los nombres con guion bajo que vienen de tu JSON de Go
    return [d.image_url_1, d.image_url_2, d.image_url_3].filter(Boolean) as string[];
  });

  // 3. Limpieza de URL para el botón
  const displayUrl = createMemo(() => {
    try {
      const url = post()?.content_url;
      return url ? new URL(url).hostname.replace(/^www\./, "") : "";
    } catch { return ""; }
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Reciente";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "Reciente" : d.toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const renderedContent = createMemo(() => {
    const content = post()?.content;
    if (!content) return "";
    return marked.parse(content);
  });

  return (
    <Suspense fallback={<div class="page-loader">Cargando...</div>}>
      <Show 
        when={post() && !post().error} 
        fallback={
          <NotFound message={`La curaduría "${params.slug}" no se encuentra en nuestros registros.`} />
        }
      >
        <article class="blog-post-container">
          <Title>{post()!.title} | Click Alternativo</Title>
          <Meta name="description" content={post()!.description} />
          {/* SEO Meta para la imagen principal */}
          <Meta property="og:image" content={post()!.image_url_1} />
          <Link rel="canonical" href={`https://clickalternativo.com/${params.category}/${post()!.slug}`} />

          <div class="post-detail-layout">
            <div class="post-visual-side">
              {/* Carrusel con las imágenes corregidas */}
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