import { For, Show } from "solid-js";
import { SiInstagram, SiYoutube } from "solid-icons/si";
import MenuButton from "../Button/MenuButton"; // Ajusta ruta
import { navLinks } from "~/data/navigation";
import "./side-bars.scss"; 

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar(props: SidebarProps) {
  return (
    <aside 
      class="sidebar"
      classList={{ "is-open": props.isOpen }} 
    >
      <div class="sidebar-header">
        <button class="close-button" onClick={props.onClose} aria-label="Cerrar menú">
          ×
        </button>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li>
            <MenuButton href="/" onClick={props.onClose}>INICIO</MenuButton>
          </li>
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
        <div class="social-links">
          <a href="https://instagram.com/Click_Alternativo" target="_blank" aria-label="Instagram">
            <SiInstagram />
          </a>
          <a href="https://youtube.com/@Click_Alternativo" target="_blank" aria-label="YouTube">
            <SiYoutube />
          </a>
        </div>
        <span>@Click_Alternativo</span>
      </footer>
    </aside>
  );
}