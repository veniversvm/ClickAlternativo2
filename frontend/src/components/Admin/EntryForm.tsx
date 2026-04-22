import { createSignal, createResource, For, Show, createMemo, createEffect } from "solid-js";
import { adminApi, blogApi } from "~/lib/api";
import "./EntryForm.scss";

interface ImageSlot {
  url: string | null;
  file: File | null;
  removed: boolean;
}

const emptySlot = (): ImageSlot => ({ url: null, file: null, removed: false });

export default function EntryForm(props: { initialData?: any; onSuccess?: () => void }) {
  const [categories] = createResource(() => blogApi.getCategories());

  // --- ESTADOS DE TEXTO ---
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [content, setContent] = createSignal("");
  const [contentUrl, setContentUrl] = createSignal("");
  const [selectedCats, setSelectedCats] = createSignal<number[]>([]);
  
  // --- ESTADO DEL FILTRO DE ETIQUETAS ---
  const [tagQuery, setTagQuery] = createSignal("");

  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [validationError, setValidationError] = createSignal("");

  const [slots, setSlots] = createSignal<[ImageSlot, ImageSlot, ImageSlot]>([
    emptySlot(), emptySlot(), emptySlot(),
  ]);

  // --- LÓGICA DE FILTRADO ---
  const filteredTags = createMemo(() => {
    const list = categories() || [];
    const search = tagQuery().toLowerCase().trim();
    if (!search) return list;
    return list.filter((cat: any) => 
      cat.name.toLowerCase().includes(search)
    );
  });

  createEffect(() => {
    if (props.initialData) {
      const d = props.initialData;
      setTitle(d.title || "");
      setDescription(d.description || "");
      setContent(d.content || "");
      setContentUrl(d.content_url || "");
      setSelectedCats(d.categories?.map((c: any) => c.id) || []);

      const urls = [
        d.image_url1 || d.image_url_1 || null,
        d.image_url2 || d.image_url_2 || null,
        d.image_url3 || d.image_url_3 || null
      ];

      setSlots(urls.map((url) => ({ 
        url: url, 
        file: null, 
        removed: false 
      })) as [ImageSlot, ImageSlot, ImageSlot]);
    }
  });

  const updateSlot = (index: number, patch: Partial<ImageSlot>) => {
    setSlots((prev) => {
      const next = [...prev] as [ImageSlot, ImageSlot, ImageSlot];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleFileSelect = (index: number, file: File | null) => {
    if (!file) return;
    updateSlot(index, { file, removed: false, url: null });
  };

  const handleRemove = (index: number) => {
    updateSlot(index, { url: null, file: null, removed: true });
  };

  const getPreview = (slot: ImageSlot) => {
    if (slot.removed) return null;
    if (slot.file) return URL.createObjectURL(slot.file);
    return slot.url;
  };

  const hasAtLeastOneImage = createMemo(() => {
    return slots().some((s) => !s.removed && (s.file !== null || s.url !== null));
  });

  const isFormValid = createMemo(() =>
    title().trim() !== "" &&
    description().trim() !== "" &&
    content().trim() !== "" &&
    contentUrl().trim() !== "" &&
    selectedCats().length > 0 &&
    hasAtLeastOneImage()
  );

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setValidationError("");
    setIsSubmitting(true);

    const fd = new FormData();
    fd.append("title", title());
    fd.append("description", description());
    fd.append("content", content());
    fd.append("content_url", contentUrl());
    fd.append("category_ids", selectedCats().join(","));

    slots().forEach((s, i) => {
      if (s.file) fd.append(`image${i + 1}`, s.file);
      if (s.removed) fd.append(`remove_image${i + 1}`, "true");
    });

    const res = props.initialData?.id 
      ? await adminApi.updateEntry(props.initialData.id, fd)
      : await adminApi.createEntry(fd);

    if (res && !res.error) {
      if (props.onSuccess) props.onSuccess();
    } else {
      setValidationError(res?.message || "Error al guardar");
    }
    setIsSubmitting(false);
  };

  return (
    <form class="admin-entry-form" onSubmit={handleSubmit}>
      <div class="form-grid">
        <div class="form-column">
          <label>Título</label>
          <input type="text" value={title()} onInput={(e) => setTitle(e.currentTarget.value)} required />

          <label>Descripción (Extracto)</label>
          <textarea value={description()} onInput={(e) => setDescription(e.currentTarget.value)} required />

          <label>Cuerpo del Blog (Markdown)</label>
          <textarea 
            class="content-editor" 
            value={content()} 
            onInput={(e) => setContent(e.currentTarget.value)} 
            required 
          />

          <label>Categorías</label>
          {/* --- NUEVO FILTRO DE ETIQUETAS --- */}
          <div class="tag-filter-wrapper">
            <input 
              type="text" 
              placeholder="🔍 Filtrar etiquetas..." 
              value={tagQuery()}
              onInput={(e) => setTagQuery(e.currentTarget.value)}
              class="tag-search-input"
            />
          </div>

          <div class="categories-selector-box">
            <For each={filteredTags()} fallback={<p class="no-tags-found">No se encontraron etiquetas.</p>}>
              {(cat: any) => (
                <span 
                  class="cat-chip" 
                  classList={{ selected: selectedCats().includes(cat.id) }} 
                  onClick={() => {
                    const id = cat.id;
                    setSelectedCats(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
                  }}
                >
                  {cat.name}
                </span>
              )}
            </For>
          </div>
        </div>

        <div class="form-column">
          <label>URL Fuente</label>
          <input type="url" value={contentUrl()} onInput={(e) => setContentUrl(e.currentTarget.value)} required />

          <label>Imágenes (Slots)</label>
          <div class="image-slots-grid">
            <For each={slots()}>
              {(slot, i) => (
                <div class="slot-container">
                  <Show when={getPreview(slot)} fallback={
                    <label class="slot-empty">
                      <input type="file" accept="image/*" hidden onChange={(e) => handleFileSelect(i(), e.target.files![0])} />
                      <span>+ IMG {i() + 1}</span>
                    </label>
                  }>
                    <div class="slot-preview">
                      <img src={getPreview(slot)!} alt="Preview" />
                      <button type="button" class="btn-remove" onClick={() => handleRemove(i())}>×</button>
                      <label class="slot-replace-overlay">
                         <input type="file" accept="image/*" hidden onChange={(e) => handleFileSelect(i(), e.target.files![0])} />
                         <span>Cambiar</span>
                      </label>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>

      <Show when={validationError()}>
        <div class="error-msg-banner">{validationError()}</div>
      </Show>

      <button type="submit" class="submit-btn-main" disabled={!isFormValid() || isSubmitting()}>
        {isSubmitting() ? "GUARDANDO..." : (props.initialData ? "ACTUALIZAR" : "PUBLICAR")}
      </button>
    </form>
  );
}