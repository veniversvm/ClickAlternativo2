import { createSignal, createResource, For, Show } from "solid-js";
import { adminApi, blogApi } from "~/lib/api";
import "./EntryForm.scss";

export default function EntryForm(props: { onSuccess?: () => void }) {
  // 1. Cargar categorías para el selector
  const [categories] = createResource(() => blogApi.getCategories());

  // 2. Estados del formulario
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [content, setContent] = createSignal("");
  const [contentUrl, setContentUrl] = createSignal("");
  const [selectedCats, setSelectedCats] = createSignal<number[]>([]);
  const [images, setImages] = createSignal<File[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [message, setMessage] = createSignal("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // --- REGLA DE NEGOCIO: FormData para imágenes ---
    const formData = new FormData();
    formData.append("title", title());
    formData.append("description", description());
    formData.append("content", content());
    formData.append("content_url", contentUrl());
    formData.append("category_ids", selectedCats().join(","));

    // Adjuntar imágenes dinámicamente
    images().forEach((file, index) => {
      formData.append(`image${index + 1}`, file);
    });

    const res = await adminApi.createEntry(formData);

    if (res && !res.error) {
      setMessage("✅ Entrada creada con éxito");
      if (props.onSuccess) props.onSuccess();
      // Limpiar formulario
      setTitle(""); setContent(""); setImages([]); setSelectedCats([]);
    } else {
      setMessage("❌ Error: " + (res?.message || "Servidor no disponible"));
    }
    setLoading(false);
  };

  const handleFileChange = (e: any) => {
    const files = Array.from(e.target.files) as File[];
    if (files.length > 3) {
      alert("Máximo 3 imágenes permitidas");
      return;
    }
    setImages(files);
  };

  return (
    <form class="admin-entry-form" onSubmit={handleSubmit}>
      <div class="form-grid">
        {/* COLUMNA IZQUIERDA: TEXTOS */}
        <div class="form-column">
          <label>Título de la Curaduría</label>
          <input type="text" value={title()} onInput={(e) => setTitle(e.currentTarget.value)} required />

          <label>Descripción corta (SEO)</label>
          <textarea value={description()} onInput={(e) => setDescription(e.currentTarget.value)} required />

          <label>Contenido Extendido (Markdown)</label>
          <textarea class="content-editor" value={content()} onInput={(e) => setContent(e.currentTarget.value)} required />
        </div>

        {/* COLUMNA DERECHA: METADATOS Y ARCHIVOS */}
        <div class="form-column">
          <label>URL Original del Contenido</label>
          <input type="url" value={contentUrl()} onInput={(e) => setContentUrl(e.currentTarget.value)} required />

          <label>Categorías (Selección múltiple)</label>
          <div class="categories-selector">
            <For each={categories()}>
              {(cat: any) => (
                <label class="cat-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedCats().includes(cat.id)}
                    onChange={() => {
                      const id = cat.id;
                      setSelectedCats(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
                    }}
                  />
                  {cat.name}
                </label>
              )}
            </For>
          </div>

          <label>Imágenes (Máx. 3 - La primera es la principal)</label>
          <input type="file" multiple accept="image/*" onChange={handleFileChange} />
          
          <div class="file-preview">
            <p>{images().length} archivos seleccionados</p>
          </div>
        </div>
      </div>

      <footer class="form-footer">
        <Show when={message()}><p class="status-msg">{message()}</p></Show>
        <button type="submit" class="submit-btn" disabled={loading()}>
          {loading() ? "Subiendo..." : "PUBLICAR ENTRADA"}
        </button>
      </footer>
    </form>
  );
}