import { getRequestEvent } from "solid-js/web";

const isServer = typeof window === "undefined";

// --- CONFIGURACIÓN DE URLS DINÁMICAS ---
// Si estamos en el navegador, usamos localhost.
// Si estamos en el servidor Bun:
//   - En Docker usamos SERVER_API_URL (http://click_api:8080)
//   - En local (bun dev) usamos la misma URL del cliente (http://localhost:8080)
const PUBLIC_API = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
const SERVER_API = isServer 
  ? (process.env.SERVER_API_URL || PUBLIC_API) 
  : PUBLIC_API;

export const API_BASE_URL = isServer ? SERVER_API : PUBLIC_API;

/**
 * Motor de peticiones con reenvío de Cookies (SSR) y Failsafe
 */
async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  // --- MAGIA DEL SSR: PASAR COOKIES DEL NAVEGADOR A GO ---
  if (isServer) {
    const event = getRequestEvent();
    const cookie = event?.request.headers.get("cookie");
    if (cookie) {
      headers.set("cookie", cookie);
      // Opcional: console.log(`[SSR] Enviando cookie a Go en ${url}`);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // 'include' permite que el navegador envíe y reciba cookies HttpOnly
      credentials: "include", 
    });

    // 204 No Content (útil para Logout o Delete)
    if (response.status === 204) return { success: true };

    // Si la sesión expiró o no es válida, devolvemos null para que AuthContext lo sepa
    if (response.status === 401 || response.status === 403) {
      return null;
    }

    const data = await response.json();
    if (!response.ok) {
      return { error: true, message: data.error || "Error desconocido", status: response.status };
    }

    return data;
  } catch (e) {
    console.error(`[API Connection Failed] No se pudo conectar a ${url}`);
    return null; // Failsafe: evita que la app explote
  }
}

// --- MÓDULOS DE API ---

export const blogApi = {
  getPaginated: async (category = "", page = 1, search = "") => {
    const params = new URLSearchParams({
      page: page.toString(),
      tag: category || "",
      search: search || ""
    });
    const data = await request(`/entries?${params.toString()}`);
    return data || { results: [], page: 1, limit: 20, error: true };
  },

  getBySlug: async (slug: string) => {
    return await request(`/entries/${slug}`);
  },

  getCategories: () => request("/categories")
};

export const authApi = {
  register: (userData: any) => request("/auth/user/register", { 
    method: "POST", body: JSON.stringify(userData) 
  }),
  
  login: (credentials: any) => request("/auth/user/login", { 
    method: "POST", body: JSON.stringify(credentials) 
  }),

  logout: () => request("/auth/user/logout", { method: "POST" }),

  getGoogleLoginUrl: () => `${API_BASE_URL}/auth/google/login`
};

export const userApi = {
  getProfile: async () => {
    const data = await request("/user/profile");
    // Si Go devuelve un error de sesión, request() devuelve null automáticamente
    return data; 
  },

  updateProfile: (data: { notify_email: boolean; notify_push: boolean; tag_ids: number[] }) => 
    request("/user/profile", { method: "PUT", body: JSON.stringify(data) }),
};