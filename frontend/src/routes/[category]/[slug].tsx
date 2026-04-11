// src/routes/[category]/[slug].tsx
import { createAsync, useParams } from "@solidjs/router";
import { fetchEntryDetail } from "~/lib/api";
import { Title, Meta } from "@solidjs/meta";
import { Show } from "solid-js";

export default function PostDetail() {
  const params = useParams();
  const post = createAsync(() => fetchEntryDetail(params.slug ?? ''));

  return (
    <Show when={post()}>
      <article class="blog-post">
        <Title>{post().title}</Title>
        <Meta name="description" content={post().description} />

        {/* Estructura PC/Mobile que definiste en blog-post.scss */}
        <div class="post-column-visual">
           <img src={post().image_url_1} />
           {/* Mostrar 2da y 3ra imagen si existen */}
           <Show when={post().image_url_2}>
             <img src={post().image_url_2} />
           </Show>
        </div>

        <div class="post-column-text">
           <h1>{post().title}</h1>
           <div class="post-content">
              {post().description}
           </div>
           <a href={post().content_url} class="visit-button">Visitar fuente</a>
        </div>
      </article>
    </Show>
  );
}