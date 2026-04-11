import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { SiGoogle } from "solid-icons/si";
import { IoMailOutline, IoLockClosedOutline } from "solid-icons/io";
import { authApi } from "~/lib/api";
import { useAuth } from "~/context/AuthContext";
import "./LoginForm.scss";

export default function LoginForm() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [message, setMessage] = createSignal<{ type: 'success' | 'error', text: string } | null>(null);

  const handleManualLogin = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await authApi.login({
      identifier: identifier(),
      password: password()
    });

    if (!result) {
      setMessage({
        type: 'error',
        text: "No podemos conectar con el servidor de acceso. Por favor, intenta más tarde."
      });
    } else if (result.error) {
      setMessage({ type: 'error', text: result.message });
    } else {
      // Refetch del resource para que Header y Sidebar se actualicen
      await auth.refetch();
      setMessage({ type: 'success', text: "¡Bienvenido de nuevo!" });
      // Navegación SPA — sin recargar la página
      navigate("/");
    }

    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = authApi.getGoogleLoginUrl();
  };

  return (
    <div class="auth-card">
      <h2>Iniciar Sesión</h2>
      <p class="auth-subtitle">Accede a tus preferencias de curaduría</p>

      <button class="google-btn" onClick={handleGoogleLogin}>
        <SiGoogle size={20} />
        Entrar con Google
      </button>

      <div class="divider">
        <span>o usa tu cuenta</span>
      </div>

      <form onSubmit={handleManualLogin} class="manual-form">
        <div class="input-group">
          <IoMailOutline class="input-icon" />
          <input
            type="text"
            placeholder="Email o Usuario"
            value={identifier()}
            onInput={(e) => setIdentifier(e.currentTarget.value)}
            required
            disabled={loading()}
          />
        </div>

        <div class="input-group">
          <IoLockClosedOutline class="input-icon" />
          <input
            type="password"
            placeholder="Tu contraseña"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
            disabled={loading()}
          />
        </div>

        <Show when={message()}>
          <div class={`message-alert ${message()?.type}`}>
            {message()?.text}
          </div>
        </Show>

        <button type="submit" class="submit-btn" disabled={loading()}>
          {loading() ? "Verificando..." : "Entrar ahora"}
        </button>
      </form>
    </div>
  );
}