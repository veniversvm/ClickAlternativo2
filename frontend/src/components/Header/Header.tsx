import { For, Show, Suspense } from "solid-js";
import { A } from "@solidjs/router";
import { navLinks } from "~/data/navigation";
import { useAuth } from "~/context/AuthContext";

export default function Header(props: {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}) {
  const auth = useAuth();

  return (
    <header class="header-container">
      <nav class="header-center">
        <A href="/" class="mini-logo-link">
          <img src="/Logo/MiniLogo.svg" alt="Inicio" class="desktop-nav-image" />
        </A>
        <For each={navLinks}>
          {(link) => (
            <A href={link.href} class="header-link" activeClass="active">
              {link.text}
            </A>
          )}
        </For>
      </nav>

      <div class="header-right">
        <Suspense fallback={<div class="auth-placeholder" />}>
          <Show
            when={auth.user()}
            fallback={<A href="/login" class="header-login-btn">ENTRAR</A>}
          >
            <div class="header-user-pill">
              <div class="header-avatar-box">
                <Show
                  when={auth.user()?.avatar_url}
                  fallback={
                    <span class="avatar-letter">
                      {auth.user()?.username?.[0]?.toUpperCase()}
                    </span>
                  }
                >
                  <img src={auth.user()!.avatar_url} alt="Avatar" />
                </Show>
              </div>
              <span class="header-username">{auth.user()?.username}</span>
              <button onClick={() => auth.logout()} class="header-logout-btn">
                SALIR
              </button>
            </div>
          </Show>
        </Suspense>

        <button
          class="header-hamburger"
          classList={{ active: props.isMenuOpen }}
          onClick={(e) => { e.stopPropagation(); props.onToggleMenu(); }}
          aria-label="Abrir/Cerrar menú"
          aria-expanded={props.isMenuOpen}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}