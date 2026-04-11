// src/app.tsx
import { createSignal, Suspense } from "solid-js";
import { MetaProvider, Title, Meta, Link } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";

// Componentes
import Header from "./components/Header/Header";
import Sidebar from "./components/Menu/SideBarMenu";
import Footer from "./components/Footer/Footer";

// IMPORTANTE: Solo dejamos app.scss porque ese ya importa a global.scss y los demás
import "./styles/app.scss"; 

export default function App() {
  // Estado global para el menú
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  // Implementación real de las funciones (sustituye a los errores)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen());
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Router
      root={(props) => (
        <MetaProvider>
          {/* SEO Global */}
          <Title>Click Alternativo</Title>
          <Meta charset="utf-8" />
          <Meta name="viewport" content="width=device-width, initial-scale=1" />
          <Link rel="icon" href="/favicon.ico" />

          <div class="app-container">
            {/* Pasamos el estado y la función de toggle al Header */}
            <Header isMenuOpen={isMenuOpen()} onToggleMenu={toggleMenu} />
            
            {/* Pasamos el estado y la función de cierre a la Sidebar */}
            <Sidebar isOpen={isMenuOpen()} onClose={closeMenu} /> 
            
            {/* El overlay ahora sí responde al click para cerrar */}
            <div 
              class="overlay" 
              classList={{ "is-visible": isMenuOpen() }} 
              onClick={closeMenu} 
            />

            <main class="main-content">
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