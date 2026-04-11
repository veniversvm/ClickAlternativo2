import { createSignal, ErrorBoundary, Suspense } from "solid-js";
import { Link, MetaProvider } from "@solidjs/meta";
import { Router, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Transition } from "solid-transition-group";
import Header from "./components/Header/Header";
import SideBarMenu from "./components/Menu/SideBarMenu";
import Footer from "./components/Footer/Footer";
import "./styles/app.scss";
import { AuthProvider } from "./context/AuthContext";

// Componente interno separado para poder usar useLocation dentro del Router
function AppShell(props: { children: any }) {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen());
  const closeMenu = () => setIsMenuOpen(false);
  const location = useLocation(); // necesita estar dentro del Router

  return (
    <AuthProvider>
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
              fallback={(err, reset) => (
                <div class="critical-error">
                  <h2>Ups, algo salió mal</h2>
                  <p>
                    El sitio sigue funcionando, pero esta sección no puede
                    cargarse.
                  </p>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button onClick={reset}>Reintentar</button>
                    <button onClick={() => (window.location.href = "/")}>
                      Volver al Inicio
                    </button>
                  </div>
                </div>
              )}
            >
              <Suspense fallback={<div class="loader">Cargando...</div>}>
                <Transition name="page-fade" mode="outin">
                  {/* En Solid, el componente hijo debe ser una función para que Transition lo detecte */}
                  {(() => {
                    const _path = location.pathname; // lee el signal para que Solid trackee el cambio
                    return <div>{props.children}</div>;
                  })()}
                </Transition>
              </Suspense>
            </ErrorBoundary>
          </main>

          <Footer />
        </div>
      </MetaProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <Router root={(props) => <AppShell>{props.children}</AppShell>}>
      <FileRoutes />
    </Router>
  );
}
