import { createResource, createSignal, For, Show, createMemo } from "solid-js";
import { Title } from "@solidjs/meta";
import { adminApi, blogApi } from "~/lib/api";
import AdminGuard from "~/components/Admin/AdminGuard";

export const config = { ssr: false };

export default function AdminTags() {
  // 1. Recursos y Estados
  const [tags, { refetch }] = createResource(() => blogApi.getCategories());
  const [loading, setLoading] = createSignal(false);
  const [message, setMessage] = createSignal({ type: "", text: "" });

  // Estado para creación
  const [newName, setNewName] = createSignal("");
  const [newType, setNewType] = createSignal("secondary");

  // Estado para edición in-line
  const [editId, setEditId] = createSignal<number | null>(null);
  const [editName, setEditName] = createSignal("");
  const [editType, setEditType] = createSignal("");

  // Buscador interno de la tabla
  const [filter, setFilter] = createSignal("");
  const filteredTags = createMemo(() => {
    const list = tags() || [];
    return list.filter((t: any) => 
      t.name.toLowerCase().includes(filter().toLowerCase()) || 
      t.slug.toLowerCase().includes(filter().toLowerCase())
    );
  });

  const handleCreate = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    const res = await adminApi.createCategory({ 
      name: newName(), 
      type: newType() 
    });
    
    if (res && !res.error) {
      setNewName("");
      setMessage({ type: "success", text: "Tag creada correctamente" });
      refetch();
    } else {
      setMessage({ type: "error", text: res?.message || "Error al crear" });
    }
    setLoading(false);
  };

  const handleUpdate = async (id: number) => {
    setLoading(true);
    const res = await adminApi.updateCategory(id, { 
        name: editName(), 
    });
    
    if (res && !res.error) {
      setEditId(null);
      refetch();
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta categoría? Solo se borrará si no hay posts usándola.")) return;
    setLoading(true);
    const res = await adminApi.deleteCategory(id);
    
    if (res && res.error) {
        alert(res.message); // El backend dirá: "Esta categoría está en uso"
    } else {
        refetch();
    }
    setLoading(false);
  };

  return (
    <AdminGuard>
      <Title>Gestión de Tags | Admin</Title>
      <div class="admin-main">
        <header class="admin-header-title">
          <h1>Tags / <span>Categorías</span></h1>
          <p>Define las secciones del menú y las etiquetas de los blogs.</p>
        </header>

        {/* --- FORMULARIO DE CREACIÓN --- */}
        <section class="admin-card-bg mb-8">
          <form class="tag-create-form" onSubmit={handleCreate}>
            <div class="form-row">
              <input 
                type="text" 
                placeholder="Nombre de la tag (ej: Gaming)" 
                value={newName()} 
                onInput={(e) => setNewName(e.currentTarget.value)}
                required
              />
              <select value={newType()} onChange={(e) => setNewType(e.currentTarget.value)}>
                <option value="secondary">Secundaria (Detalle)</option>
                <option value="primary">Primaria (Menú)</option>
              </select>
              <button type="submit" disabled={loading() || !newName()}>CREAR TAG</button>
            </div>
          </form>
        </section>

        {/* --- BUSCADOR Y TABLA --- */}
        <section class="table-section">
          <div class="table-tools">
             <input 
                type="text" 
                placeholder="🔍 Filtrar lista..." 
                value={filter()}
                onInput={(e) => setFilter(e.currentTarget.value)}
                class="table-search"
             />
          </div>

          <Show when={!tags.loading} fallback={<p>Cargando etiquetas...</p>}>
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Slug (SEO)</th>
                  <th>Tipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <For each={filteredTags()}>
                  {(tag: any) => (
                    <tr classList={{ "editing-row": editId() === tag.id }}>
                      <td>
                        <Show when={editId() === tag.id} fallback={<strong>{tag.name}</strong>}>
                          <input value={editName()} onInput={(e) => setEditName(e.currentTarget.value)} />
                        </Show>
                      </td>
                      <td><code>/{tag.slug}</code></td>
                      <td>
                         <Show when={editId() === tag.id} fallback={
                            <span class={`pill ${tag.type}`}>{tag.type.toUpperCase()}</span>
                         }>
                           <select value={editType()} onChange={(e) => setEditType(e.currentTarget.value)}>
                             <option value="secondary">SECONDARY</option>
                             <option value="primary">PRIMARY</option>
                           </select>
                         </Show>
                      </td>
                      <td class="admin-actions">
                        <Show when={editId() === tag.id} fallback={
                          <>
                            <button onClick={() => { 
                                setEditId(tag.id); 
                                setEditName(tag.name);
                                setEditType(tag.type);
                            }}>EDITAR</button>
                            <button class="danger" onClick={() => handleDelete(tag.id)}>BORRAR</button>
                          </>
                        }>
                          <button class="save" onClick={() => handleUpdate(tag.id)}>GUARDAR</button>
                          <button onClick={() => setEditId(null)}>X</button>
                        </Show>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </Show>
        </section>
      </div>
    </AdminGuard>
  );
}