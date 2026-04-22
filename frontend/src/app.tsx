import { createSignal, ErrorBoundary, Show, Suspense } from "solid-js";
import { Link, MetaProvider, Title, Meta } from "@solidjs/meta";
import { Router, useLocation } from "@solidjs/router"; // Importamos useLocation
import { FileRoutes } from "@solidjs/start/router";
import { Transition } from "solid-transition-group";
import { Key } from "@solid-primitives/keyed"; // <
import Header from "./components/Header/Header";
import SideBarMenu from "./components/Menu/SideBarMenu";
import Footer from "./components/Footer/Footer";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { HomeStoreProvider } from "./context/HomeStore";
import "./styles/app.scss";

function AppShell(props: { children: any }) {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen());
  const closeMenu = () => setIsMenuOpen(false);

  // VITAL: location sirve para avisarle a la transición que la ruta cambió
  const location = useLocation();

  return (
    <MetaProvider>
      {/* 1. Iconos del navegador y dispositivos móviles */}
      <Link rel="icon" type="image/svg+xml" href="/Logo/MiniLogo2.svg" />
      <Link rel="apple-touch-icon" href="/Logo/MiniLogo2.svg" />

      {/* 2. SEO Estándar en Español */}
      <Title>Click Alternativo | Curaduría de Contenido Humano</Title>
      <Meta name="description" content="Selección manual de lo mejor de la web: Noticias, Software, Gaming y Cine." />

      {/* 3. Open Graph - Esto es lo que lee WhatsApp y Facebook */}
      <Meta property="og:type" content="website" />
      <Meta property="og:title" content="Click Alternativo" />
      <Meta property="og:description" content="Contenido web seleccionado a mano con criterio humano." />
      <Meta property="og:url" content="https://clickalternativo.com" />
      {/* VITAL: URL absoluta para que WhatsApp la encuentre siempre */}
      <Meta property="og:image" content="https://clickalternativo.com/Logo/LogoClickAlternativo.png" />
      <Meta property="og:image:alt" content="Logo de Click Alternativo" />

      {/* 4. Twitter Cards */}
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:image" content="https://clickalternativo.com/Logo/LogoClickAlternativo.png" />
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
            fallback={(err, reset) => {
              // Log para depurar qué está rompiendo el sitio realmente
              console.error("ErrorBoundary caught:", err);
              return (
                <div class="critical-error">
                  <h2>Error de visualización</h2>
                  <p>
                    Detalle técnico:{" "}
                    {err?.message || "Conflicto de hidratación"}
                  </p>
                  <button class="btn-primary" onClick={reset}>
                    Reintentar
                  </button>
                </div>
              );
            }}
          >
            <Suspense fallback={<div class="page-loader">Cargando...</div>}>
              {/* 
                FIX 1: mode="out-in" (con guión)
                FIX 2: Encapsular children en un div con KEY único por ruta
              */}
              <Transition name="page-fade" mode="outin">
                <Show when={location.pathname} keyed>
                  <div class="page-transition-wrapper">{props.children}</div>
                </Show>
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
        <HomeStoreProvider>
          {/* El Router DEBE ser el componente raíz que define el root layout */}
          <Router root={(props) => <AppShell>{props.children}</AppShell>}>
            <FileRoutes />
          </Router>
        </HomeStoreProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}
