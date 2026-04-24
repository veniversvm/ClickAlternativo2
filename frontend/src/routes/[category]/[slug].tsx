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
  const post = createAsync(() => blogApi.getBySlug(params.slug ?? ""));

  const status = createMemo(() => {
    const res = post();
    if (res === undefined) return "loading";
    if (!res || res.error) return "404";
    return "success";
  });

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

  // --- MEJORA 1: Esquema Combinado (Artículo + Breadcrumbs) ---
  const jsonLd = createMemo(() => {
    const d = post();
    if (status() !== "success" || !d) return null;

    const fullUrl = `https://clickalternativo.com/${params.category}/${d.slug}`;

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "headline": d.title,
          "description": d.description,
          "image": postImages(),
          "datePublished": d.created_at,
          "dateModified": d.updated_at || d.created_at,
          "mainEntityOfPage": { "@type": "WebPage", "@id": fullUrl },
          "author": { "@type": "Organization", "name": "Click Alternativo" }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://clickalternativo.com" },
            { "@type": "ListItem", "position": 2, "name": params.category!.toUpperCase(), "item": `https://clickalternativo.com/${params.category!}` },
            { "@type": "ListItem", "position": 3, "name": d.title, "item": fullUrl }
          ]
        }
      ]
    };
  });

  return (
    <Suspense fallback={<Title>Cargando... | Click Alternativo</Title>}>
      <Show when={status() !== "loading"} fallback={<div class="page-loader">Sincronizando...</div>}>
        <Show when={status() === "success"} fallback={<NotFound message="Contenido no encontrado." />}>
          
          {/* --- MEJORA 2: Metadatos Sociales Blindados --- */}
          <Title>{post()!.title} | Click Alternativo</Title>
          <Meta name="description" content={post()!.description} />
          <Link rel="canonical" href={`https://clickalternativo.com/${params.category}/${post()!.slug}`} />
          
          {/* Open Graph (Facebook/WhatsApp) */}
          <Meta property="og:title" content={post()!.title} />
          <Meta property="og:description" content={post()!.description} />
          <Meta property="og:image" content={post()!.image_url_1} />
          <Meta property="og:type" content="article" />
          <Meta property="og:url" content={`https://clickalternativo.com/${params.category}/${post()!.slug}`} />
          
          {/* Twitter */}
          <Meta name="twitter:card" content="summary_large_image" />
          <Meta name="twitter:title" content={post()!.title} />
          <Meta name="twitter:image" content={post()!.image_url_1} />

          <script type="application/ld+json">{JSON.stringify(jsonLd())}</script>

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
                  {/* MEJORA 3: Semántica de Fecha con tag <time> */}
                  <time class="post-date" datetime={post()!.created_at}>
                    Publicado el {new Date(post()!.created_at).toLocaleDateString("es-ES", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </time>
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