import { createSignal, createResource, For, Show, onMount } from "solid-js";
import { useAuth } from "~/context/AuthContext";
import { blogApi, userApi } from "~/lib/api";
import "./UserSettings.scss";

export default function UserSettings() {
  const auth = useAuth();
  
  // Cargamos todas las categorías disponibles en el sistema
  const [allCategories] = createResource(() => blogApi.getCategories());

  // Estados del formulario
  const [notifyEmail, setNotifyEmail] = createSignal(false);
  const [notifyPush, setNotifyPush] = createSignal(false);
  const [selectedTags, setSelectedTags] = createSignal<number[]>([]);
  const [isSaving, setIsSaving] = createSignal(false);
  const [message, setMessage] = createSignal("");

  // Sincronizar estados locales con los datos actuales del usuario
  onMount(() => {
    const user = auth.user();
    if (user) {
      setNotifyEmail(user.notify_email);
      setNotifyPush(user.notify_push);
      // Extraemos solo los IDs de las tags preferidas
      setSelectedTags(user.preferred_tags?.map((t: any) => t.id) || []);
    }
  });

  const toggleTag = (id: number) => {
    if (selectedTags().includes(id)) {
      setSelectedTags(selectedTags().filter(t => t !== id));
    } else {
      setSelectedTags([...selectedTags(), id]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await userApi.updateProfile({
      notify_email: notifyEmail(),
      notify_push: notifyPush(),
      tag_ids: selectedTags()
    });

    if (result && !result.error) {
      setMessage("¡Preferencias guardadas!");
      auth.refetch(); // Actualizamos el contexto global
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Error al guardar cambios.");
    }
    setIsSaving(false);
  };

  return (
    <div class="settings-card">
      <header class="settings-header">
        <img src={auth.user()?.avatar_url || "/default-avatar.png"} class="settings-avatar" />
        <h2>Ajustes de Perfil</h2>
        <p>{auth.user()?.email}</p>
      </header>

      <section class="settings-section">
        <h3>Notificaciones</h3>
        <div class="setting-item">
          <label>
            <span>Recibir alertas por Email</span>
            <input 
              type="checkbox" 
              checked={notifyEmail()} 
              onChange={(e) => setNotifyEmail(e.currentTarget.checked)} 
            />
          </label>
        </div>
        <div class="setting-item">
          <label>
            <span>Notificaciones Push en navegador</span>
            <input 
              type="checkbox" 
              checked={notifyPush()} 
              onChange={(e) => setNotifyPush(e.currentTarget.checked)} 
            />
          </label>
        </div>
      </section>

      <section class="settings-section">
        <h3>Mis Intereses</h3>
        <p class="section-hint">Selecciona las categorías de las que quieres recibir novedades:</p>
        <div class="tags-grid">
          <For each={allCategories()}>
            {(cat: any) => (
              <button 
                class="tag-pill-btn" 
                classList={{ active: selectedTags().includes(cat.id) }}
                onClick={() => toggleTag(cat.id)}
              >
                {cat.name}
              </button>
            )}
          </For>
        </div>
      </section>

      <footer class="settings-footer">
        <Show when={message()}>
           <p class="status-msg">{message()}</p>
        </Show>
        <button class="save-btn" disabled={isSaving()} onClick={handleSave}>
          {isSaving() ? "Guardando..." : "Guardar Cambios"}
        </button>
      </footer>
    </div>
  );
}