import { createAsync, useParams, A } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
import { For, Show } from "solid-js";
import { blogApi } from "~/lib/api";
import "~/styles/blogpost.scss";

export const config = { prerender: false, ssr: true };

export default function PostDetail() {
  const params = useParams();
  const post = createAsync(() => blogApi.getBySlug(params.slug ?? ""));

  const images = () =>
    [post()?.image_url_1, post()?.image_url_2, post()?.image_url_3].filter(Boolean) as string[];

  const displayUrl = () => {
    try {
      return post()?.content_url
        ? new URL(post()!.content_url).hostname.replace(/^www\./, "")
        : "";
    } catch {
      return post()?.content_url ?? "";
    }
  };

  return (
    <Show when={post()} fallback={<div class="page-loader">Cargando...</div>}>
      <Title>{post()!.title} | Click Alternativo</Title>
      <Meta name="description" content={post()!.description} />

      <article class="blog-post">
        <div class="post-column-visual">
          <Show
            when={images().length > 0}
            fallback={<div class="image-placeholder-large" />}
          >
            <div class="post-images">
              <For each={images()}>
                {(url) => (
                  <img
                    src={url}
                    alt={post()!.title}
                    class="post-image"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </For>
            </div>
          </Show>

          <Show when={post()!.categories?.length > 0}>
            <div class="tags-container">
              <h3>ETIQUETAS</h3>
              <ul class="tags-list">
                <For each={post()!.categories}>
                  {(cat) => (
                    <li>
                      <A href={`/${cat.slug}`}>{cat.name.toUpperCase()}</A>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </Show>

          <Show when={post()!.content_url}>
            <div class="visit-link-container">
              
                href={post()!.content_url!}
                class="visit-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visitar {displayUrl()}
              </a>
            </div>
          </Show>

          <div class="back-button-container">
            <button class="back-button" onClick={() => history.back()}>
              Regresar
            </button>
          </div>
        </div>

        <div class="post-column-text">
          <header class="post-header">
            <h1 class="post-title">{post()!.title}</h1>
          </header>
          <div class="post-content">
            <p>{post()!.description}</p>
          </div>
        </div>
      </article>
    </Show>
  );
}