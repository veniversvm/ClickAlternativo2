// src/components/admin/AdminPostsTable.tsx
import { For } from "solid-js";

export function AdminPostsTable(props: { posts: any[], onDelete: (id: string) => void }) {
  
  const formatDate = (dateStr: string) => {
    // Intentamos CreatedAt o created_at (GORM a veces alterna)
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Reciente";
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  return (
    <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 40%">TÍTULO / SLUG</th>
            <th style="width: 30%">CATEGORÍAS</th>
            <th style="width: 15%">FECHA</th>
            <th style="width: 15%">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.posts} fallback={
            <tr><td colspan="4" class="td-empty">No se encontraron resultados</td></tr>
          }>
            {(post) => (
              <tr>
                <td>
                  <div class="td-title-info">
                    <strong>{post.title}</strong>
                    <code>/{post.slug}</code>
                  </div>
                </td>
                <td>
                  <div class="td-tags">
                    {post.categories?.map((c: any) => (
                      <span class="mini-tag">{c.name}</span>
                    ))}
                  </div>
                </td>
                {/* Corregimos el campo de fecha: Go usa CreatedAt por defecto en JSON */}
                <td>{formatDate(post.CreatedAt || post.created_at)}</td>
                <td class="admin-actions">
                  <button class="btn-danger" onClick={() => props.onDelete(post.id)}>
                    ELIMINAR
                  </button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}