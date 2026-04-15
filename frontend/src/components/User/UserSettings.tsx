import {
  createSignal,
  createResource,
  For,
  Show,
  createEffect,
  createMemo,
} from "solid-js";
import { useAuth } from "~/context/AuthContext";
import { blogApi, userApi } from "~/lib/api";
import "./UserSettings.scss";

export default function UserSettings() {
  const auth = useAuth();
  const [allCategories] = createResource(() => blogApi.getCategories());

  const [notifyEmail, setNotifyEmail] = createSignal(false);
  const [notifyPush, setNotifyPush] = createSignal(false);
  const [selectedTags, setSelectedTags] = createSignal<number[]>([]);

  // --- NUEVO: Estado para el buscador de etiquetas ---
  const [tagSearch, setTagSearch] = createSignal("");

  // Cambiamos isSaving por isSubmitting para que coincida con el resto del código
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [message, setMessage] = createSignal<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  createEffect(() => {
    const user = auth.user();
    if (user) {
      setNotifyEmail(user.notify_email ?? false);
      setNotifyPush(user.notify_push ?? false);
      setSelectedTags(user.preferred_tags?.map((t: any) => t.id) ?? []);
    }
  });

  // --- LÓGICA DE FILTRADO ---
  const filteredTags = createMemo(() => {
    const list = allCategories() || [];
    const query = tagSearch().toLowerCase().trim();
    if (!query) return list;
    return list.filter((cat: any) => cat.name.toLowerCase().includes(query));
  });

  const toggleTag = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true); // Cambiado aquí
    setMessage(null);

    const result = await userApi.updateProfile({
      notify_email: notifyEmail(),
      notify_push: notifyPush(),
      tag_ids: selectedTags(),
    });

    if (result && !result.error) {
      setMessage({ type: "success", text: "¡Preferencias guardadas!" });
      auth.refetch();
    } else {
      setMessage({ type: "error", text: "Error al guardar cambios." });
    }

    setIsSubmitting(false); // Cambiado aquí
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div class="settings-card">
      <header class="settings-header">
        <div class="settings-avatar-box">
          <Show
            when={auth.user()?.avatar_url}
            fallback={
              <span class="settings-avatar-letter">
                {auth.user()?.username?.[0]?.toUpperCase()}
              </span>
            }
          >
            <img
              src={auth.user()!.avatar_url}
              alt="Avatar"
              class="settings-avatar"
            />
          </Show>
        </div>
        <div class="settings-user-info">
          <h2>{auth.user()?.username}</h2>
          <p>{auth.user()?.email}</p>
        </div>
      </header>

      <section class="settings-section">
        <h3>Notificaciones</h3>
        <label class="setting-toggle">
          <span>Alertas por Email</span>
          <input
            type="checkbox"
            checked={notifyEmail()}
            onChange={(e) => setNotifyEmail(e.currentTarget.checked)}
          />
          <span class="toggle-track">
            <span class="toggle-thumb" />
          </span>
        </label>
      </section>

      <section class="settings-section">
        <h3>Mis Intereses</h3>
        <p class="section-hint">
          Seleccioná las categorías de las que querés recibir novedades:
        </p>

        {/* --- NUEVO: Input del Buscador --- */}
        <div class="tag-filter-container">
          <input
            type="text"
            placeholder="Filtrar etiquetas..."
            value={tagSearch()}
            onInput={(e) => setTagSearch(e.currentTarget.value)}
            class="tag-filter-input"
          />
          <Show when={tagSearch()}>
            <button class="clear-search" onClick={() => setTagSearch("")}>
              ×
            </button>
          </Show>
        </div>

        <Show
          when={!allCategories.loading}
          fallback={<p class="section-hint">Cargando categorías...</p>}
        >
          <div class="tags-grid">
            <For
              each={filteredTags()}
              fallback={
                <p class="no-results-msg">
                  No encontramos etiquetas que coincidan con "{tagSearch()}"
                </p>
              }
            >
              {(cat: any) => (
                <button
                  class="tag-pill-btn"
                  classList={{ active: selectedTags().includes(cat.id) }}
                  onClick={() => toggleTag(cat.id)}
                  type="button"
                >
                  {cat.name}
                </button>
              )}
            </For>
          </div>
        </Show>
      </section>

      <footer class="settings-footer">
        <Show when={message()}>
          <p class={`status-msg ${message()?.type}`}>{message()?.text}</p>
        </Show>
        <button
          class="save-btn"
          disabled={isSubmitting()}
          onClick={handleSave}
          type="button"
        >
          {isSubmitting() ? "Guardando..." : "Guardar Cambios"}
        </button>
      </footer>
    </div>
  );
}
