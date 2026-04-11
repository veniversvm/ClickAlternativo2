import { createSignal, Suspense } from "solid-js";
import { MetaProvider, Title, Meta, Link } from "@solidjs/meta";
import { Router, A } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import SideBarMenu from "./components/Menu/SideBarMenu";
import NavLinks from "./components/Menu/NavLinks";
import Footer from "./components/Footer/Footer";
import "./styles/app.scss";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen());
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <div class="app-container">
            {/* --- HEADER --- */}
            <header class="main-header">
              <A href="/" class="header-logo">Click Alternativo</A>
              
              {/* Botón Hamburguesa (Fijo en móvil por CSS) */}
              <button
                class="hamburger-button"
                classList={{ "is-active": isMenuOpen() }}
                onClick={toggleMenu}
              >
                <span class="line line1"></span>
                <span class="line line2"></span>
                <span class="line line3"></span>
              </button>

              {/* Menú de escritorio */}
              <nav class="desktop-nav">
                <A href="/">
                  <img src="/Logo/MiniLogo.svg" class="desktop-nav-image" alt="Logo" />
                </A>
                <NavLinks />
              </nav>
            </header>

            {/* --- NAVEGACIÓN MÓVIL (Fuera del main) --- */}
            <SideBarMenu isOpen={isMenuOpen()} onClose={closeMenu} />
            
            {/* Overlay: Reemplaza al selector ~ de Astro */}
            <div 
              class="overlay" 
              classList={{ "is-visible": isMenuOpen() }} 
              onClick={closeMenu} 
            />

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main>
              <Suspense>{props.children}</Suspense>
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