// src/components/Menu/SidebarAuthItem.tsx
import { Show } from "solid-js";
import { useAuth } from "~/context/AuthContext";
import MenuButton from "../Button/MenuButton";

export default function SidebarAuthItem(props: { onClose: () => void }) {
  const auth = useAuth();

  return (
    <Show
      when={auth.user()}
      fallback={
        <li>
          <MenuButton href="/login" onClick={props.onClose} class="login-link-highlight">
            ENTRAR
          </MenuButton>
        </li>
      }
    >
      <li>
        <MenuButton href="/perfil" onClick={props.onClose} class="profile-link-highlight">
          MI PERFIL
        </MenuButton>
      </li>
    </Show>
  );
}