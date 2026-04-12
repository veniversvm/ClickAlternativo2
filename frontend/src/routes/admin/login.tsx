import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { useAdminAuth } from "~/context/AdminAuthContext";

export default function AdminLogin() {
  const admin = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const ok = await admin.login(email(), password());
    if (ok) {
      navigate("/admin");
    } else {
      setError("Credenciales inválidas");
    }
    setLoading(false);
  };

  return (
    <>
      <Title>Login Admin | Click Alternativo</Title>
      <div class="admin-login-page">
        <form class="admin-login-form" onSubmit={handleLogin}>
          <h1>Panel de Administración</h1>
          <input
            type="email"
            placeholder="Email"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
          />
          {error() && <p class="admin-error">{error()}</p>}
          <button type="submit" disabled={loading()}>
            {loading() ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </>
  );
}