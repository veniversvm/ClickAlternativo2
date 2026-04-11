// src/components/Header/AuthSection.tsx
import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { useAuth } from "~/context/AuthContext";

export default function AuthSection() {
  const auth = useAuth();

  return (
    <Show
      when={auth.user()}
      fallback={<A href="/login" class="header-login-btn">ENTRAR</A>}
    >
      <div class="header-user-pill">
        <div class="header-avatar-box">
          <Show
            when={auth.user()?.avatar_url}
            fallback={
              <span class="avatar-letter">
                {auth.user()?.username?.[0]?.toUpperCase()}
              </span>
            }
          >
            <img src={auth.user()!.avatar_url} alt="Avatar" />
          </Show>
        </div>
        <span class="header-username">{auth.user()?.username}</span>
        <button onClick={() => auth.logout()} class="header-logout-btn">
          SALIR
        </button>
      </div>
    </Show>
  );
}