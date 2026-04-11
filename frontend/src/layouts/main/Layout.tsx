// src/app.tsx
import { createSignal, Suspense } from "solid-js";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";


// Estilos reciclados
import "./styles/normalize.css";
import "./styles/global.scss";
import "./styles/layout.scss";
import Sidebar from "~/components/Menu/SideBarMenu";
import Footer from "~/components/Footer/Footer";
import Header from "~/components/Header/Header";

export default function App() {
  // Estado único para controlar el menú en toda la app
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen());
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Router
      root={(props) => (
        <MetaProvider>
          {/* SEO Base: Cada página puede sobrescribir estos valores */}
          <Title>Click Alternativo</Title>
          <Meta charset="utf-8" />
          <Meta name="viewport" content="width=device-width, initial-scale=1" />

          <Header
            isMenuOpen={isMenuOpen()} 
            onToggleMenu={toggleMenu} 
          />

          <main>
            <Sidebar 
              isOpen={isMenuOpen()} 
              onClose={closeMenu} 
            />
            
            {/* Overlay Reactivo: Se cierra al hacer click */}
            <div 
              class="overlay" 
              classList={{ "is-visible": isMenuOpen() }} 
              onClick={closeMenu}
            />

            <Suspense>
              {props.children}
            </Suspense>
          </main>

          <Footer />
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}