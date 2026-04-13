import { createAsync, useParams, A } from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { For, Show, Suspense, createMemo } from "solid-js";
import { blogApi } from "~/lib/api";
import Carousel from "~/components/Carousel/Carousel";
import { marked } from "marked"; // Importamos el parser
import "~/styles/blogpost.scss";

export default function PostDetailPage() {
  const params = useParams();
  const post = createAsync(() => blogApi.getBySlug(params.slug ?? ""));

  const postImages = createMemo(() => {
    const data = post();
    if (!data) return [];
    return [data.image_url_1, data.image_url_2, data.image_url_3].filter(Boolean) as string[];
  });

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

  // --- NUEVA FUNCIÓN: Transforma Markdown a HTML ---
  const renderedContent = createMemo(() => {
    const content = post()?.content;
    if (!content) return "";
    return marked.parse(content); // Convierte ### en <h3>, etc.
  });

  return (
    <Suspense fallback={<div class="page-loader">Preparando curaduría...</div>}>
      <Show when={post()} fallback={<div class="content-not-found"><h1>404</h1><A href="/">Volver</A></div>}>
        <article class="blog-post-container">
          <Title>{post()!.title} | Click Alternativo</Title>
          <Meta name="description" content={post()!.description} />
          <Link rel="canonical" href={`https://clickalternativo.com/${params.category}/${post()!.slug}`} />

          <div class="post-detail-layout">
            <div class="post-visual-side">
              <Carousel images={postImages()} />
              <div class="navigation-wrapper-simple">
                <a href={post()!.content_url} target="_blank" rel="noopener noreferrer" class="visit-button-full">
                  VISITAR {displayUrl().toUpperCase()}
                </a>
              </div>
            </div>

            <div class="post-info-side">
              <header class="post-header">
                <h1 class="post-title">{post()!.title}</h1>
                <p class="post-date">Curado el {formatDate(post()!.created_at)}</p>
              </header>

              {/* Descripción corta destacada */}
              <div class="post-description-lead">
                <p>{post()!.description}</p>
              </div>

              {/* CUERPO DEL CONTENIDO (Markdown renderizado) */}
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
                        <A href={`/${cat.slug}`} class="tag-pill">{cat.name.toUpperCase()}</A>
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