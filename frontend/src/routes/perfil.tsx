import { Title } from "@solidjs/meta";
import { Show } from "solid-js";
import { useAuth } from "~/context/AuthContext";
import UserSettings from "~/components/User/UserSettings";

export default function ProfilePage() {
  const auth = useAuth();

  return (
    <main class="container mx-auto p-4">
      <Title>Mi Perfil | Click Alternativo</Title>
      
      {/* Solo mostramos los ajustes si el usuario está cargado */}
      <Show 
        when={auth.user()} 
        fallback={<p class="text-center p-10">Debes iniciar sesión para ver esta página.</p>}
      >
        <UserSettings />
      </Show>
    </main>
  );
}