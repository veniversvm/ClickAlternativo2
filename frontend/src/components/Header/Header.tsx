import { A } from "@solidjs/router";
import { For } from "solid-js";
import { navLinks } from "~/data/navigation";

interface HeaderProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

export default function Header(props: HeaderProps) {
  return (
    <header class="main-header">
      {/* Logo principal */}
      <A href="/" class="header-logo" activeClass="is-active" end={true}>
        Click Alternativo
      </A>

      {/* Botón Hamburguesa Reactivo */}
      <button
        class="hamburger-button"
        // classList aplica 'is-active' solo si isMenuOpen es true
        classList={{ "is-active": props.isMenuOpen }}
        onClick={(e) => {
          e.stopPropagation(); // Evita que el click cierre el menú inmediatamente
          props.onToggleMenu();
        }}
        aria-label="Abrir/Cerrar menú"
        aria-expanded={props.isMenuOpen}
      >
        <span class="line line1"></span>
        <span class="line line2"></span>
        <span class="line line3"></span>
      </button>

      {/* Menú de escritorio (Solo visible en PC por CSS) */}
      <nav class="desktop-nav">
        <A href="/" class="mini-logo-link" end={true}>
          <img 
            src="/Logo/MiniLogo.svg" 
            alt="Inicio" 
            class="desktop-nav-image" 
          />
        </A>
        
        <For each={navLinks}>
          {(link) => (
            <A 
              href={link.href} 
              class="nav-link" 
              activeClass="active-page" // Clase para resaltar el link actual
            >
              {link.text}
            </A>
          )}
        </For>
      </nav>
    </header>
  );
}