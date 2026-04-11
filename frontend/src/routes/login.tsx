// src/routes/login.tsx
// src/routes/login.tsx
import { createSignal, Show } from "solid-js";
import { Title, Meta } from "@solidjs/meta";
import LoginForm from "~/components/Auth/LoginForm";
import SubscribeForm from "~/components/Auth/SubscribeForm";
import "./auth-page.scss";

export default function AuthPage() {
  // 'login' o 'register'
  const [mode, setMode] = createSignal<'login' | 'register'>('login');

  return (
    <main class="auth-page-container">
      <Title>{mode() === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'} | Click Alternativo</Title>
      <Meta name="description" content="Únete a la comunidad de Click Alternativo y gestiona tus preferencias de curaduría." />

      <div class="auth-wrapper">
        {/* Selector de pestañas (Tabs) */}
        <div class="auth-tabs">
          <button 
            class="tab-btn" 
            classList={{ active: mode() === 'login' }} 
            onClick={() => setMode('login')}
          >
            Entrar
          </button>
          <button 
            class="tab-btn" 
            classList={{ active: mode() === 'register' }} 
            onClick={() => setMode('register')}
          >
            Registrarse
          </button>
        </div>

        {/* Contenedor Dinámico con Transición */}
        <div class="auth-form-container">
          <Show 
            when={mode() === 'login'} 
            fallback={<SubscribeForm />}
          >
            <LoginForm />
          </Show>
        </div>

        {/* Link de ayuda rápido debajo del formulario */}
        <p class="auth-switch-text">
          {mode() === 'login' 
            ? "¿Aún no tienes cuenta?" 
            : "¿Ya eres miembro?"}
          <button onClick={() => setMode(mode() === 'login' ? 'register' : 'login')}>
            {mode() === 'login' ? ' Crea una aquí' : ' Inicia sesión'}
          </button>
        </p>
      </div>
    </main>
  );
}