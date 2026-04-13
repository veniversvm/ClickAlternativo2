import { createAsync, useParams, A } from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { For, Show, Suspense, createMemo } from "solid-js";
import { blogApi } from "~/lib/api";
import Carousel from "~/components/Carousel/Carousel";
import "~/styles/blogpost.scss";

export default function PostDetailPage() {
  const params = useParams();
  
  // 1. Pedimos los datos del post (SSR automático)
  const post = createAsync(() => blogApi.getBySlug(params.slug ?? ""));

  // 2. Memoizamos las imágenes para el Carousel
  const postImages = createMemo(() => {
    const data = post();
    if (!data) return [];
    return [data.image_url_1, data.image_url_2, data.image_url_3].filter(Boolean) as string[];
  });

  // 3. Limpiamos el hostname para el botón de visita
  const displayUrl = createMemo(() => {
    try {
      const url = post()?.content_url;
      return url ? new URL(url).hostname.replace(/^www\./, "") : "";
    } catch {
      return "";
    }
  });

  // 4. Función de fecha segura para evitar "Invalid Date"
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Reciente";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "Reciente" : d.toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <Suspense fallback={<div class="page-loader">Preparando curaduría...</div>}>
      <Show when={post()} fallback={
        <div class="content-not-found">
          <h1>404</h1>
          <p>Lo sentimos, este contenido no está disponible.</p>
          <A href="/">Volver al inicio</A>
        </div>
      }>
        <article class="blog-post-container">
          {/* SEO Dinámico */}
          <Title>{post()!.title} | Click Alternativo</Title>
          <Meta name="description" content={post()!.description} />
          <Meta property="og:image" content={post()!.image_url_1} />
          <Link rel="canonical" href={`https://clickalternativo.com/${params.category}/${post()!.slug}`} />

          <div class="post-detail-layout">
            {/* COLUMNA VISUAL (Izquierda) */}
            <div class="post-visual-side">
              <Carousel images={postImages()} />
              
              {/* Botón de Visita Simple (Sustituye a las flechas) */}
              <div class="navigation-wrapper-simple">
                <a href={post()!.content_url} target="_blank" rel="noopener noreferrer" class="visit-button-full">
                  VISITAR {displayUrl().toUpperCase()}
                </a>
              </div>
            </div>

            {/* COLUMNA DE INFORMACIÓN (Derecha) */}
            <div class="post-info-side">
              <header class="post-header">
                <h1 class="post-title">{post()!.title}</h1>
                <p class="post-date">Curado el {formatDate(post()!.created_at)}</p>
              </header>

              <div class="post-description-body">
                <p>{post()!.description}</p>
              </div>

              {/* Sección de Etiquetas con Grid/Flex corregido */}
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