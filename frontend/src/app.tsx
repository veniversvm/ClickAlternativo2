// src/app.tsx
import { createSignal, ErrorBoundary, Suspense } from "solid-js";
import { Link, MetaProvider, Title, Meta } from "@solidjs/meta"; // Html eliminado
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Transition } from "solid-transition-group";
import Header from "./components/Header/Header";
import SideBarMenu from "./components/Menu/SideBarMenu";
import Footer from "./components/Footer/Footer";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import "./styles/app.scss";

function AppShell(props: { children: any }) {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen());
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <MetaProvider>
      {/* METADATOS DE LOCALIZACIÓN (SEO Social y Google) */}
      <Title>Click Alternativo | Curaduría de Contenido Humano</Title>
      <Meta name="description" content="Contenido web seleccionado a mano con criterio humano. Noticias, Software, Gaming y más." />
      
      {/* Geo-tagging y Locale para Redes Sociales */}
      <Meta property="og:locale" content="es_ES" />
      <Meta property="og:type" content="website" />
      <Meta property="og:site_name" content="Click Alternativo" />
      
      <Link rel="icon" type="image/svg+xml" href="/Logo/MiniLogo.svg" />
      
      <div class="app-container">
        <Header isMenuOpen={isMenuOpen()} onToggleMenu={toggleMenu} />
        <SideBarMenu isOpen={isMenuOpen()} onClose={closeMenu} />
        <div
          class="overlay"
          classList={{ "is-visible": isMenuOpen() }}
          onClick={closeMenu}
        />

        <main class="main-content">
          <ErrorBoundary
            fallback={(err, reset) => (
              <div class="critical-error">
                <h2>Error de visualización</h2>
                <p>Lo sentimos, ha ocurrido un problema al cargar esta sección.</p>
                <div style={{ display: "flex", gap: "1rem", "justify-content": "center" }}>
                  <button class="btn-primary" onClick={reset}>Reintentar</button>
                  <button class="btn-secondary" onClick={() => (window.location.href = "/")}>Volver al Inicio</button>
                </div>
              </div>
            )}
          >
            <Suspense fallback={<div class="page-loader">Cargando...</div>}>
              <Transition name="page-fade" mode="outin">
                {/* 
                  Usamos un div simple como contenedor de transición 
                  para asegurar que SolidJS gestione bien las llaves del DOM.
                */}
                <div class="page-wrapper">
                  {props.children}
                </div>
              </Transition>
            </Suspense>
          </ErrorBoundary>
        </main>

        <Footer />
      </div>
    </MetaProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router root={(props) => <AppShell>{props.children}</AppShell>}>
          <FileRoutes />
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}