// frontend/src/components/Menu/SideBarMenu.tsx
import { For } from "solid-js";
import { A } from "@solidjs/router";
import { navLinks } from "~/data/navigation";
import MenuButton from "../Button/MenuButton";

export default function SideBarMenu(props: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <aside
      id="sidebar-menu"
      class="sidebar"
      classList={{ "is-open": props.isOpen }}
    >
      <div class="sidebar-header">
        <button class="close-button" onClick={props.onClose}>
          ×
        </button>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li>
            <MenuButton href="/" onClick={props.onClose}>
              INICIO
            </MenuButton>
          </li>
          {/* NavLinks debe renderizar <li> internamente, o envuelves aquí */}
          <For each={navLinks}>
            {(link: { href: any; text: any; }) => (
              <li>
                <A href={link.href} class="menu-button" onClick={props.onClose}>
                  {link.text}
                </A>
              </li>
            )}
          </For>
        </ul>
      </nav>

      <footer class="sidebar-footer">
        <div class="social-links">
          <a href="#" aria-label="Instagram">
            IG
          </a>
          <a href="#" aria-label="YouTube">
            YT
          </a>
        </div>
        <span>@Click_Alternativo</span>
      </footer>
    </aside>
  );
}
