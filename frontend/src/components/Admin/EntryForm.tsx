import { createSignal, createResource, For, Show, createMemo } from "solid-js";
import { adminApi, blogApi } from "~/lib/api";
import "./EntryForm.scss";

export default function EntryForm(props: { onSuccess?: () => void }) {
  const [categories] = createResource(() => blogApi.getCategories());

  // --- ESTADOS DE TEXTO ---
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [content, setContent] = createSignal("");
  const [contentUrl, setContentUrl] = createSignal("");
  
  // --- ESTADOS DE CATEGORÍAS ---
  const [selectedCats, setSelectedCats] = createSignal<number[]>([]);
  const [catSearch, setCatSearch] = createSignal("");

  // --- ESTADOS DE IMÁGENES (3 SLOTS) ---
  const [img1, setImg1] = createSignal<File | null>(null);
  const [img2, setImg2] = createSignal<File | null>(null);
  const [img3, setImg3] = createSignal<File | null>(null);

  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [message, setMessage] = createSignal("");

  // --- LÓGICA DE FILTRADO DE CATEGORÍAS ---
  const filteredCategories = createMemo(() => {
    const list = categories() || [];
    const search = catSearch().toLowerCase();
    if (!search) return list;
    return list.filter((c: any) => c.name.toLowerCase().includes(search));
  });

  // --- VALIDACIÓN DE FORMULARIO ---
  // El botón solo se activa si todos los campos tienen datos
  // (Asumimos que al menos la imagen 1 es obligatoria para el feed)
  const isFormValid = createMemo(() => {
    return (
      title().trim().length > 0 &&
      description().trim().length > 0 &&
      content().trim().length > 0 &&
      contentUrl().trim().length > 0 &&
      selectedCats().length > 0 &&
      img1() !== null // Imagen principal obligatoria
    );
  });

  const toggleCategory = (id: number) => {
    setSelectedCats(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleImageChange = (slot: 1 | 2 | 3, file: File | undefined) => {
    if (!file) return;
    if (slot === 1) setImg1(file);
    if (slot === 2) setImg2(file);
    if (slot === 3) setImg3(file);
  };

  const removeImage = (slot: 1 | 2 | 3) => {
    if (slot === 1) setImg1(null);
    if (slot === 2) setImg2(null);
    if (slot === 3) setImg3(null);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fd = new FormData();
    fd.append("title", title());
    fd.append("description", description());
    fd.append("content", content());
    fd.append("content_url", contentUrl());
    fd.append("category_ids", selectedCats().join(","));

    if (img1()) fd.append("image1", img1()!);
    if (img2()) fd.append("image2", img2()!);
    if (img3()) fd.append("image3", img3()!);

    const res = await adminApi.createEntry(fd);
    if (res && !res.error) {
      setMessage("✅ Publicado con éxito");
      if (props.onSuccess) props.onSuccess();
    } else {
      setMessage("❌ Error al subir");
    }
    setIsSubmitting(false);
  };

  return (
    <form class="admin-entry-form" onSubmit={handleSubmit}>
      <div class="form-main-grid">
        {/* COLUMNA IZQUIERDA */}
        <div class="form-column">
          <label>Título</label>
          <input type="text" value={title()} onInput={(e) => setTitle(e.currentTarget.value)} />

          <label>Descripción Corta</label>
          <textarea value={description()} onInput={(e) => setDescription(e.currentTarget.value)} />

          <label>Contenido (Markdown)</label>
          <textarea class="content-editor" value={content()} onInput={(e) => setContent(e.currentTarget.value)} />
        </div>

        {/* COLUMNA DERECHA */}
        <div class="form-sidebar">
          <label>URL Original</label>
          <input type="url" value={contentUrl()} onInput={(e) => setContentUrl(e.currentTarget.value)} />

          {/* BUSCADOR DE CATEGORÍAS */}
          <label>Categorías</label>
          <div class="cat-search-box">
            <input 
              type="text" 
              placeholder="Filtrar categorías..." 
              value={catSearch()} 
              onInput={(e) => setCatSearch(e.currentTarget.value)}
            />
            <Show when={catSearch()}>
               <button type="button" onClick={() => setCatSearch("")}>Limpiar</button>
            </Show>
          </div>
          <div class="categories-grid-mini">
            <For each={filteredCategories()}>
              {(cat: any) => (
                <button 
                  type="button"
                  class="cat-pill" 
                  classList={{ active: selectedCats().includes(cat.id) }}
                  onClick={() => toggleCategory(cat.id)}
                >
                  {cat.name}
                </button>
              )}
            </For>
          </div>

          {/* SLOTS DE IMÁGENES */}
          <label>Imágenes (1 Principal, 2-3 Opcionales)</label>
          <div class="image-slots-grid">
            <ImageSlot num={1} file={img1()} onFile={(f) => handleImageChange(1, f)} onRemove={() => removeImage(1)} />
            <ImageSlot num={2} file={img2()} onFile={(f) => handleImageChange(2, f)} onRemove={() => removeImage(2)} />
            <ImageSlot num={3} file={img3()} onFile={(f) => handleImageChange(3, f)} onRemove={() => removeImage(3)} />
          </div>

          <div class="submit-section">
            <Show when={message()}><p class="msg">{message()}</p></Show>
            <button 
              type="submit" 
              class="publish-btn" 
              disabled={!isFormValid() || isSubmitting()}
            >
              {isSubmitting() ? "SUBIENDO..." : "PUBLICAR ENTRADA"}
            </button>
            <Show when={!isFormValid() && !isSubmitting()}>
                <p class="validation-hint">Completa todos los campos e Imagen 1 para activar.</p>
            </Show>
          </div>
        </div>
      </div>
    </form>
  );
}

// Sub-componente para los slots de imagen
function ImageSlot(props: { num: number, file: File | null, onFile: (f: File) => void, onRemove: () => void }) {
  return (
    <div class="img-slot">
      <Show when={props.file} fallback={
        <label class="upload-placeholder">
          <span>+ IMG {props.num}</span>
          <input type="file" hidden accept="image/*" onChange={(e) => props.onFile(e.target.files![0])} />
        </label>
      }>
        <div class="preview-container">
          <img src={URL.createObjectURL(props.file!)} alt="preview" />
          <button type="button" class="remove-img" onClick={props.onRemove}>×</button>
        </div>
      </Show>
    </div>
  );
}