import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { IoArrowBack, IoArrowForward } from 'solid-icons/io';
import "./PostNavigation.scss";

interface PostLink {
  slug: string;
  title: string;
}

interface PostNavigationProps {
  previousPost?: PostLink | null;
  nextPost?: PostLink | null;
  externalUrl?: string | null;
  displayUrl?: string | null;
  currentTag?: string | null;
}

export default function PostNavigation(props: PostNavigationProps) {
  return (
    <nav class="post-navigation">
      {/* Botón de Post Anterior */}
      <Show
        when={props.previousPost}
        fallback={
          <span class="arrow-button disabled" aria-disabled="true">
            <IoArrowBack size={24} />
          </span>
        }
      >
        <A
          href={`/${props.currentTag}/${props.previousPost?.slug}`}
          class="arrow-button"
          aria-label={`Ir al post anterior: ${props.previousPost?.title}`}
        >
          <IoArrowBack size={24} />
        </A>
      </Show>

      {/* Botón Central Dinámico (Visitar o Volver) */}
      <Show
        when={props.externalUrl && props.displayUrl}
        fallback={
          <button
            class="center-button"
            onClick={() => window.history.back()}
            aria-label="Volver a la página anterior"
          >
            Volver
          </button>
        }
      >
        <a
          href={props.externalUrl!}
          class="center-button"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visitar {props.displayUrl}
        </a>
      </Show>

      {/* Botón de Post Siguiente */}
      <Show
        when={props.nextPost}
        fallback={
          <span class="arrow-button disabled" aria-disabled="true">
            <IoArrowForward size={24} />
          </span>
        }
      >
        <A
          href={`/${props.currentTag}/${props.nextPost?.slug}`}
          class="arrow-button"
          aria-label={`Ir al post siguiente: ${props.nextPost?.title}`}
        >
          <IoArrowForward size={24} />
        </A>
      </Show>
    </nav>
  );
}