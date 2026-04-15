import { createAsync, useParams, useNavigate } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { adminApi } from "~/lib/api";
import EntryForm from "~/components/Admin/EntryForm";
import AdminGuard from "~/components/Admin/AdminGuard";

export const config = { ssr: false };

export default function EditPostPage() {
  const params = useParams();
  const navigate = useNavigate();
  
  // 1. Cargamos los datos por ID
  // IMPORTANTE: params.id debe coincidir con el nombre del archivo [id].tsx
  const entry = createAsync(() => adminApi.getEntryById(params.id ?? ""));

  console.log(entry)

  return (
    <AdminGuard>
      <div class="admin-main">
        <header class="admin-header-title">
            <h1>Editar <span>Curaduría</span></h1>
            <p>ID: {params.id}</p>
        </header>

        <Suspense fallback={<div class="admin-loader">Cargando datos originales...</div>}>
          <Show 
            when={entry()} 
            fallback={<div class="admin-error-msg">No se encontró el registro en la base de datos.</div>}
          >
            <div class="admin-card-bg">
              <EntryForm 
                initialData={entry()} 
                onSuccess={() => navigate("/admin/posts")} // Redirigir a la lista plural
              />
            </div>
          </Show>
        </Suspense>
      </div>
    </AdminGuard>
  );
}