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
  
  // 1. Recurso asíncrono
  const post = createAsync(() => blogApi.getBySlug(params.slug ?? ""));

  // 2. Clasificación de estado (Esto evita el bloqueo de carga infinita)
  // 'loading' | 'error' | 'success'
  const postState = createMemo(() => {
    const data = post();
    if (data === undefined) return "loading";
    if (!data || data.error) return "error";
    return "success";
  });

  // 3. Memos de datos (solo se ejecutan en estado 'success')
  const postImages = createMemo(() => {
    const d = post();
    if (postState() !== "success") return [];
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

  return (
    // El Suspense maneja el Título global mientras la red está ocupada
    <Suspense fallback={<Title>Cargando... | Click Alternativo</Title>}>
      
      <Show when={postState() !== "loading"} fallback={<div class="page-loader">Cargando contenido curado...</div>}>
        
        <Show 
          when={postState() === "success"} 
          fallback={<NotFound message={`La curaduría "${params.slug}" no existe.`} />}
        >
          {/* --- TODO LO QUE SIGUE SOLO SE RENDERIZA SI HAY ÉXITO --- */}
          <Title>{post()!.title} | Click Alternativo</Title>
          <Meta name="description" content={post()!.description} />
          <Meta property="og:image" content={post()!.image_url_1} />
          <Link rel="canonical" href={`https://clickalternativo.com/${params.category}/${post()!.slug}`} />

          <article class="blog-post-container">
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
                </header>

                <div class="post-description-lead">
                  <p>{post()!.description}</p>
                </div>

                <div class="post-main-content" innerHTML={renderedContent() as string} />

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
      </Show>
    </Suspense>
  );
}