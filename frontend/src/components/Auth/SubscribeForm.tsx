import { createSignal, Show } from "solid-js";
import { SiGoogle } from "solid-icons/si";
import { IoMailOutline, IoLockClosedOutline, IoPersonOutline } from "solid-icons/io";
import { authApi } from "~/lib/api"; // Importamos nuestro nuevo motor de API
import "./SubscribeForm.scss";

export default function SubscribeForm() {
  const [email, setEmail] = createSignal("");
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [message, setMessage] = createSignal<{ type: 'success' | 'error', text: string } | null>(null);

  const handleManualRegister = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Usamos el módulo authApi que creamos en lib/api.ts
    const result = await authApi.register({ 
      email: email(), 
      username: username(), 
      password: password() 
    });

    if (!result) {
      // CASO: API CAÍDA (Failsafe devolvió null)
      setMessage({ 
        type: 'error', 
        text: "Nuestro servicio de registro no está disponible en este momento. Por favor, inténtalo más tarde." 
      });
    } else if (result.error) {
      // CASO: Error controlado (ej: Email ya existe)
      setMessage({ 
        type: 'error', 
        text: result.message 
      });
    } else {
      // CASO: ÉXITO
      setMessage({ 
        type: 'success', 
        text: "¡Cuenta creada con éxito! Redirigiendo al inicio..." 
      });
      setTimeout(() => window.location.href = "/", 2000);
    }

    setLoading(false);
  };

  const handleGoogleLogin = () => {
    // Usamos la URL dinámica que detecta si es localhost o Contabo automáticamente
    window.location.href = authApi.getGoogleLoginUrl();
  };

  return (
    <div class="auth-card">
      <h2>Únete a Click Alternativo</h2>
      <p class="auth-subtitle">Recibe curaduría humana en tu bandeja de entrada</p>

      {/* Botón de Google */}
      <button class="google-btn" onClick={handleGoogleLogin}>
        <SiGoogle size={20} />
        Registrarse con Google
      </button>

      <div class="divider">
        <span>o usa tu correo</span>
      </div>

      {/* Formulario Manual */}
      <form onSubmit={handleManualRegister} class="manual-form">
        <div class="input-group">
          <IoPersonOutline class="input-icon" />
          <input 
            type="text" 
            placeholder="Nombre de usuario" 
            value={username()}
            onInput={(e) => setUsername(e.currentTarget.value)}
            required 
            disabled={loading()}
          />
        </div>

        <div class="input-group">
          <IoMailOutline class="input-icon" />
          <input 
            type="email" 
            placeholder="Tu mejor email" 
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            required 
            disabled={loading()}
          />
        </div>

        <div class="input-group">
          <IoLockClosedOutline class="input-icon" />
          <input 
            type="password" 
            placeholder="Contraseña segura" 
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
          {loading() ? "Procesando..." : "Crear mi cuenta"}
        </button>
      </form>
    </div>
  );
}