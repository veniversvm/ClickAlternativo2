import { For } from "solid-js";
import { A } from "@solidjs/router";

export function AdminPostsTable(props: { posts: any[], onDelete: (id: string) => void }) {
  
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Reciente";
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  return (
    <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 45%">TÍTULO / SLUG</th>
            <th style="width: 25%">CATEGORÍAS</th>
            <th style="width: 10%">FECHA</th>
            <th style="width: 20%">ACCIONES</th>
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
                    {/* Hacemos que el título sea un link directo a editar */}
                    <A href={`/admin/posts/${post.id}`} class="table-title-link">
                      <strong>{post.title}</strong>
                    </A>
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
                <td>{formatDate(post.CreatedAt || post.created_at)}</td>
                <td class="admin-actions">
                  {/* Botón de Editar */}
                  <A href={`/admin/posts/${post.id}`} class="admin-btn-edit">
                    EDITAR
                  </A>
                  
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