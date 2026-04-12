import { createSignal, createResource, For, Show, createEffect } from "solid-js";
import { useAuth } from "~/context/AuthContext";
import { blogApi, userApi } from "~/lib/api";
import "./UserSettings.scss";

export default function UserSettings() {
  const auth = useAuth();

  const [allCategories] = createResource(() => blogApi.getCategories());

  const [notifyEmail, setNotifyEmail] = createSignal(false);
  const [notifyPush, setNotifyPush] = createSignal(false);
  const [selectedTags, setSelectedTags] = createSignal<number[]>([]);
  const [isSaving, setIsSaving] = createSignal(false);
  const [message, setMessage] = createSignal<{ type: "success" | "error"; text: string } | null>(null);

  // createEffect en lugar de onMount — espera a que el resource resuelva
  createEffect(() => {
    const user = auth.user();
    if (user) {
      setNotifyEmail(user.notify_email ?? false);
      setNotifyPush(user.notify_push ?? false);
      setSelectedTags(user.preferred_tags?.map((t: any) => t.id) ?? []);
    }
  });

  const toggleTag = (id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
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

    setIsSaving(false);
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
            <img src={auth.user()!.avatar_url} alt="Avatar" class="settings-avatar" />
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
        <label class="setting-toggle">
          <span>Notificaciones Push</span>
          <input
            type="checkbox"
            checked={notifyPush()}
            onChange={(e) => setNotifyPush(e.currentTarget.checked)}
          />
          <span class="toggle-track">
            <span class="toggle-thumb" />
          </span>
        </label>
      </section>

      <section class="settings-section">
        <h3>Mis Intereses</h3>
        <p class="section-hint">
          Selecciona las categorías de las que querés recibir novedades:
        </p>
        <Show when={!allCategories.loading} fallback={<p class="section-hint">Cargando categorías...</p>}>
          <div class="tags-grid">
            <For each={allCategories()}>
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
        <button class="save-btn" disabled={isSaving()} onClick={handleSave} type="button">
          {isSaving() ? "Guardando..." : "Guardar Cambios"}
        </button>
      </footer>
    </div>
  );
}