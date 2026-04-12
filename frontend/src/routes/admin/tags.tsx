import { createResource, createSignal, For, Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { blogApi, adminApi } from "~/lib/api";

export default function AdminTags() {
  const [tags, { refetch }] = createResource(() => blogApi.getCategories());
  const [name, setName] = createSignal("");
  const [editId, setEditId] = createSignal<number | null>(null);
  const [editName, setEditName] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleCreate = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    await adminApi.createCategory({ name: name() });
    setName("");
    await refetch();
    setLoading(false);
  };

  const handleUpdate = async (id: number) => {
    setLoading(true);
    await adminApi.updateCategory(id, { name: editName() });
    setEditId(null);
    await refetch();
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    setLoading(true);
    await adminApi.deleteCategory(id);
    await refetch();
    setLoading(false);
  };

  return (
    <>
      <Title>Tags | Admin</Title>
      <div class="admin-page">
        <h2>Tags / Categorías</h2>

        <form class="admin-form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Nombre de la nueva tag"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            required
          />
          <button type="submit" disabled={loading()}>Crear</button>
        </form>

        <Show when={!tags.loading} fallback={<p>Cargando...</p>}>
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <For each={tags()}>
                {(tag: any) => (
                  <tr>
                    <td>{tag.id}</td>
                    <td>
                      <Show
                        when={editId() === tag.id}
                        fallback={<span>{tag.name}</span>}
                      >
                        <input
                          value={editName()}
                          onInput={(e) => setEditName(e.currentTarget.value)}
                        />
                      </Show>
                    </td>
                    <td class="admin-actions">
                      <Show
                        when={editId() === tag.id}
                        fallback={
                          <>
                            <button onClick={() => { setEditId(tag.id); setEditName(tag.name); }}>
                              Editar
                            </button>
                            <button class="danger" onClick={() => handleDelete(tag.id)}>
                              Eliminar
                            </button>
                          </>
                        }
                      >
                        <button onClick={() => handleUpdate(tag.id)}>Guardar</button>
                        <button onClick={() => setEditId(null)}>Cancelar</button>
                      </Show>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </Show>
      </div>
    </>
  );
}