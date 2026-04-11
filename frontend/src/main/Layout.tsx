// src/app.tsx
import { createSignal, Suspense, For } from "solid-js";
import { MetaProvider, Title, Meta, Link } from "@solidjs/meta";
import { Router, A } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";

// Componentes y Datos

import "./styles/app.scss"; 
import { navLinks } from "~/data/navigation";
import SideBarMenu from "~/components/Menu/SideBarMenu";
import Footer from "~/components/Footer/Footer";

export default function App() {
  // ESTADO REACTIVO: Sustituye a todo tu bloque <script> de Astro
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen());
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Router
      root={(props) => (
        <MetaProvider>
          {/* SEO Dinámico: Se actualiza según la página */}
          <Title>Click Alternativo</Title>
          <Meta charset="utf-8" />
          <Meta name="viewport" content="width=device-width, initial-scale=1" />
          <Link rel="icon" href="/favicon.ico" />

          <div class="app-container">
            {/* HEADER COMPONENTIZADO */}
            <header class="main-header">
              <A href="/" class="header-logo" onClick={closeMenu}>
                Click Alternativo
              </A>

              {/* Botón Hamburguesa Reactivo */}
              <button
                class="hamburger-button"
                classList={{ "is-active": isMenuOpen() }}
                onClick={toggleMenu}
                aria-label="Abrir/Cerrar menú"
                aria-expanded={isMenuOpen()}
              >
                <span class="line line1"></span>
                <span class="line line2"></span>
                <span class="line line3"></span>
              </button>

              {/* Menú de Escritorio */}
              <nav class="desktop-nav">
                <A href="/" class="mini-logo-link">
                  <img 
                    class="desktop-nav-image"
                    src="/Logo/MiniLogo.svg" 
                    alt="Inicio"
                  />
                </A>
                <For each={navLinks}>
                  {(link) => (
                    <A href={link.href} class="nav-link">
                      {link.text}
                    </A>
                  )}
                </For>
              </nav>
            </header>

            <main class="main-content">
              {/* SIDEBAR Y OVERLAY */}
              <SideBarMenu isOpen={isMenuOpen()} onClose={closeMenu} />
              
              <div 
                class="overlay" 
                classList={{ "is-visible": isMenuOpen() }} 
                onClick={closeMenu} 
              />

              {/* CONTENIDO DE LAS RUTAS (index, post, etc.) */}
              <Suspense fallback={<div class="loader">Cargando...</div>}>
                {props.children}
              </Suspense>
            </main>

            <Footer />
          </div>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}