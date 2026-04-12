import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { useAdminAuth } from "~/context/AdminAuthContext";

export default function AdminDashboard() {
  const admin = useAdminAuth();

  return (
    <>
      <Title>Panel Admin | Click Alternativo</Title>
      <div class="admin-layout">
        <aside class="admin-sidebar">
          <h2 class="admin-brand">⚙ Admin</h2>
          <nav class="admin-nav">
            <A href="/admin" end class="admin-nav-link">Dashboard</A>
            <A href="/admin/tags" class="admin-nav-link">Tags / Categorías</A>
            <A href="/admin/posts" class="admin-nav-link">Entradas</A>
            {admin.isSuperAdmin() && (
              <A href="/admin/admins" class="admin-nav-link super">Administradores</A>
            )}
          </nav>
          <button class="admin-logout-btn" onClick={() => admin.logout()}>
            Cerrar Sesión
          </button>
        </aside>

        <main class="admin-main">
          <h1>Bienvenido, {admin.email()}</h1>
          <div class="admin-cards">
            <A href="/admin/tags" class="admin-card">
              <span class="admin-card-icon">🏷</span>
              <span>Gestionar Tags</span>
            </A>
            <A href="/admin/posts" class="admin-card">
              <span class="admin-card-icon">📝</span>
              <span>Gestionar Entradas</span>
            </A>
          </div>
        </main>
      </div>
    </>
  );
}