import { For, Show, Suspense } from "solid-js";
import { navLinks } from "~/data/navigation";
import { useAuth } from "~/context/AuthContext";
import MenuButton from "../Button/MenuButton";

export default function SideBarMenu(props: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const auth = useAuth();

  return (
    <aside class="sidebar" classList={{ "is-open": props.isOpen }}>
      <button class="close-button" onClick={props.onClose}>×</button>

      <nav class="sidebar-nav">
        <ul>
          <li>
            <MenuButton href="/" onClick={props.onClose}>INICIO</MenuButton>
          </li>

          <Suspense>
            <Show
              when={auth.user()}
              fallback={
                <li>
                  <MenuButton href="/login" onClick={props.onClose} class="login-link-highlight">
                    ENTRAR
                  </MenuButton>
                </li>
              }
            >
              <li>
                <MenuButton href="/perfil" onClick={props.onClose} class="profile-link-highlight">
                  MI PERFIL
                </MenuButton>
              </li>
            </Show>
          </Suspense>

          <For each={navLinks}>
            {(link) => (
              <li>
                <MenuButton href={link.href} onClick={props.onClose}>
                  {link.text}
                </MenuButton>
              </li>
            )}
          </For>
        </ul>
      </nav>

      <footer class="sidebar-footer">
        <span class="handle-text">@Click_Alternativo</span>
        <Suspense>
          <Show when={auth.user()}>
            <button
              onClick={() => { auth.logout(); props.onClose(); }}
              class="sidebar-logout"
            >
              Cerrar Sesión
            </button>
          </Show>
        </Suspense>
      </footer>
    </aside>
  );
}