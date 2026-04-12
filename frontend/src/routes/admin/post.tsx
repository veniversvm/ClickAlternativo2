import { createResource, createSignal, For, Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { adminApi, blogApi } from "~/lib/api";

export default function AdminPosts() {
  const [page, setPage] = createSignal(1);
  const [posts, { refetch }] = createResource(
    page,
    (p) => blogApi.getPaginated("", p, "")
  );
  const [loading, setLoading] = createSignal(false);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta entrada?")) return;
    setLoading(true);
    await adminApi.deleteEntry(id);
    await refetch();
    setLoading(false);
  };

  return (
    <>
      <Title>Entradas | Admin</Title>
      <div class="admin-page">
        <div class="admin-page-header">
          <h2>Entradas</h2>
          <A href="/admin/posts/new" class="admin-btn-primary">+ Nueva Entrada</A>
        </div>

        <Show when={!posts.loading} fallback={<p>Cargando...</p>}>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Slug</th>
                <th>Categorías</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <For each={posts()?.results}>
                {(post: any) => (
                  <tr>
                    <td>{post.title}</td>
                    <td><code>{post.slug}</code></td>
                    <td>{post.categories?.map((c: any) => c.name).join(", ")}</td>
                    <td class="admin-actions">
                      <A href={`/admin/posts/${post.id}`} class="admin-btn-edit">
                        Editar
                      </A>
                      <button class="danger" onClick={() => handleDelete(post.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>

          <div class="admin-pagination">
            <button disabled={page() === 1} onClick={() => setPage(p => p - 1)}>
              ← Anterior
            </button>
            <span>Página {page()}</span>
            <button onClick={() => setPage(p => p + 1)}>
              Siguiente →
            </button>
          </div>
        </Show>
      </div>
    </>
  );
}