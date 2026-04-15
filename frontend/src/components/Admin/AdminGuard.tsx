// src/components/Admin/AdminGuard.tsx
import { Show, createEffect, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAdminAuth } from "~/context/AdminAuthContext";

export default function AdminGuard(props: { children: any }) {
  const admin = useAdminAuth();
  const navigate = useNavigate();

  createEffect(() => {
    // Si terminó de cargar y no está logueado, fuera de aquí
    if (!admin.loading() && !admin.isLoggedIn()) {
      console.warn("Acceso no autorizado. Redirigiendo...");
      navigate("/admin/login", { replace: true });
    }
  });

  return (
    <Show 
      when={admin.isLoggedIn()} 
      fallback={<div class="admin-loading">Verificando autorización...</div>}
    >
      {props.children}
    </Show>
  );
}