import { createResource, createSignal, useTransition, Show, Suspense } from "solid-js";
import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { adminApi, blogApi } from "~/lib/api";
import AdminGuard from "~/components/Admin/AdminGuard";

// Sub-componentes internos para organizar
import { AdminPostsTable } from "~/components/Admin/AdminPostsTable"; 
import { AdminPagination } from "~/components/Admin/AdminPagination"; 

export const config = { ssr: false };

export default function AdminPostsList() {
  const [page, setPage] = createSignal(1);
  const [searchTerm, setSearchTerm] = createSignal("");
  const [pending, start] = useTransition();

  // Recurso reactivo: Solo se dispara cuando page o searchTerm cambian
  const [posts, { refetch }] = createResource(
    () => ({ p: page(), s: searchTerm() }),
    async ({ p, s }) => await blogApi.getPaginated("", p, s)
  );

  const changePage = (newPage: number) => {
    start(() => setPage(newPage));
  };

  return (
    <AdminGuard>
      <Title>Gestión de Entradas | Admin</Title>
      <div class="admin-main">
        
        {/* HEADER FIJO: No se recarga nunca */}
        <div class="admin-page-header">
          <div>
            <h1>Curadurías <span>Publicadas</span></h1>
            <p class="total-count">
              <Show when={!posts.loading} fallback={<span>Calculando...</span>}>
                Total: <strong>{posts()?.total || 0}</strong> curadurías
              </Show>
            </p>
          </div>
          <A href="/admin/posts/new" class="admin-btn-primary">+ NUEVA ENTRADA</A>
        </div>

        {/* BARRA DE BÚSQUEDA: Independiente */}
        <div class="admin-table-tools">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Filtrar por título o tag..." 
              value={searchTerm()}
              onInput={(e) => start(() => { 
            setPage(1); 
            setSearchTerm(e.currentTarget.value); 
            })} 
            />
          </div>
        </div>

        {/* ZONA DINÁMICA: Solo esto se verá afectado por la carga */}
        <Suspense fallback={<div class="admin-table-skeleton">Actualizando lista...</div>}>
          <div class="admin-content-fade-in">
            
            <AdminPagination 
              page={page()} 
              setPage={changePage} 
              hasNext={posts()?.results?.length === 20} 
            />

            <AdminPostsTable 
              posts={posts()?.results || []} 
              onDelete={async (id) => {
                if(confirm("¿Eliminar?")) {
                  await adminApi.deleteEntry(id);
                  refetch();
                }
              }} 
            />

            <AdminPagination 
              page={page()} 
              setPage={changePage} 
              hasNext={posts()?.results?.length === 20} 
            />
          </div>
        </Suspense>
      </div>
    </AdminGuard>
  );
}