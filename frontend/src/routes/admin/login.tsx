import { createSignal, onMount, Show } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { useAdminAuth } from "~/context/AdminAuthContext";

// --- VITAL: Desactiva el SSR para esta página ---
export const config = { ssr: false };

export default function AdminLogin() {
  const admin = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  // Al no haber SSR, onMount se ejecuta inmediatamente al cargar
  onMount(() => {
    if (admin.isLoggedIn()) {
      navigate("/admin");
    }
  });

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
        const success = await admin.login(email(), password());
        if (success) {
            // USAR ESTO en lugar de navigate
            window.location.href = "/admin"; 
        } else {
            setError("Credenciales incorrectas.");
        }
    } catch (err) {
        setError("Error de conexión.");
    } finally {
        setIsSubmitting(false);
    }
};

  return (
    <main class="admin-login-page">
      <Title>Staff Login | Click Alternativo</Title>
      <div class="admin-login-container">
        <form class="admin-login-form" onSubmit={handleLogin}>
          <h1>Panel Control</h1>
          <p>Solo personal autorizado</p>

          <input
            type="email"
            placeholder="admin@clickalternativo.com"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            required
            class="admin-input"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
            class="admin-input"
          />

          <Show when={error()}>
            <p class="admin-error-msg">{error()}</p>
          </Show>

          <button 
            type="submit" 
            class="admin-login-btn"
            disabled={isSubmitting()}
          >
            {isSubmitting() ? "Autenticando..." : "Acceder al Panel"}
          </button>
        </form>
      </div>
    </main>
  );
}