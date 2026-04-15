import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import AdminGuard from "~/components/Admin/AdminGuard";
import { useAdminAuth } from "~/context/AdminAuthContext";

export const config = { ssr: false };

export default function AdminDashboard() {
  const admin = useAdminAuth();

  return (
    <>
      <AdminGuard>
        <Title>Panel Admin | Click Alternativo</Title>
        <div class="admin-layout">
          {/* BARRA LATERAL */}
          <aside class="admin-sidebar">
            <h2 class="admin-brand">⚙ Admin Panel</h2>
            <nav class="admin-nav">
              <A href="/admin" end class="admin-nav-link" activeClass="active">
                Dashboard
              </A>
              <A href="/admin/tags" class="admin-nav-link" activeClass="active">
                Tags / Categorías
              </A>
              <A
                href="/admin/posts"
                class="admin-nav-link"
                activeClass="active"
              >
                Entradas
              </A>
              {admin.isSuperAdmin() && (
                <A href="/admin/admins" class="admin-nav-link super">
                  Administradores
                </A>
              )}
            </nav>
            <button class="admin-logout-btn" onClick={() => admin.logout()}>
              Cerrar Sesión
            </button>
          </aside>

          {/* CONTENIDO PRINCIPAL */}
          <main class="admin-main">
            <header class="admin-header-title">
              <h1>
                Bienvenido, <span>{admin.email()}</span>
              </h1>
            </header>

            <div class="admin-cards">
              <A href="/admin/tags" class="admin-card">
                <span class="admin-card-icon">🏷</span>
                <div class="admin-card-text">
                  <h3>Gestionar Tags</h3>
                  <p>Crea o edita categorías principales y secundarias.</p>
                </div>
              </A>
              <A href="/admin/posts" class="admin-card">
                <span class="admin-card-icon">📝</span>
                <div class="admin-card-text">
                  <h3>Gestionar Entradas</h3>
                  <p>Publica nuevas curadurías o edita las existentes.</p>
                </div>
              </A>
            </div>
          </main>
        </div>
      </AdminGuard>
    </>
  );
}
