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
