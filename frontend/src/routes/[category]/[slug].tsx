import { createAsync, useParams, A } from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { For, Show, Suspense, createMemo } from "solid-js";
import { blogApi } from "~/lib/api";
import Carousel from "~/components/Carousel/Carousel";
import { marked } from "marked";
import NotFound from "~/components/Common/NotFound";
import "~/styles/blogpost.scss";

export const config = { prerender: false, ssr: true };

export default function PostDetailPage() {
  const params = useParams();
  
  // 1. Cargamos el post (SSR automático)
  // createAsync devuelve 'undefined' mientras la petición está en vuelo
  const post = createAsync(() => blogApi.getBySlug(params.slug ?? ""));

  // 2. Determinamos el estado real para evitar el error del título 404
  const status = createMemo(() => {
    const res = post();
    if (res === undefined) return "loading";
    // Si la API no devuelve nada o hay un flag de error, es 404
    if (!res || res.error) return "404";
    return "success";
  });

  // 3. Memos de datos (solo se calculan si el estado es 'success')
  const postImages = createMemo(() => {
    const d = post();
    if (status() !== "success") return [];
    return [d.image_url_1, d.image_url_2, d.image_url_3].filter(Boolean) as string[];
  });

  const displayUrl = createMemo(() => {
    try {
      const url = post()?.content_url;
      return url ? new URL(url).hostname.replace(/^www\./, "") : "";
    } catch { return ""; }
  });

  const renderedContent = createMemo(() => {
    const content = post()?.content;
    return content ? marked.parse(content) : "";
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Reciente";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "Reciente" : d.toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    // El Suspense maneja el título de la pestaña durante la carga inicial
    <Suspense fallback={<Title>Cargando curaduría... | Click Alternativo</Title>}>
      
      {/* CAPA 1: Esperamos a que la API responda (deje de ser undefined) */}
      <Show 
        when={status() !== "loading"} 
        fallback={<div class="page-loader">Sincronizando con el catálogo...</div>}
      >
        
        {/* CAPA 2: Si ya cargó, verificamos si el post existe */}
        <Show 
          when={status() === "success"} 
          fallback={
            <NotFound message={`La curaduría "${params.slug}" no existe en la sección ${params.category}.`} />
          }
        >
          {/* --- SEO Y METADATOS: Solo se inyectan en caso de ÉXITO --- */}
          <Title>{post()!.title} | Click Alternativo</Title>
          <Meta name="description" content={post()!.description} />
          <Meta property="og:image" content={post()!.image_url_1} />
          <Link rel="canonical" href={`https://clickalternativo.com/${params.category}/${post()!.slug}`} />

          <article class="blog-post-container">
            <div class="post-detail-layout">
              
              {/* COLUMNA VISUAL (Sticky en PC) */}
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

              {/* COLUMNA DE TEXTO E INFORMACIÓN */}
              <div class="post-info-side">
                <header class="post-header">
                  <h1 class="post-title">{post()!.title}</h1>
                  <p class="post-date">Curado el {formatDate(post()!.created_at)}</p>
                </header>

                <div class="post-description-lead">
                  <p>{post()!.description}</p>
                </div>

                {/* Renderizado de Markdown */}
                <div 
                  class="post-main-content" 
                  innerHTML={renderedContent() as string} 
                />

                {/* Etiquetas / Categorías */}
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
      </Show>
    </Suspense>
  );
}