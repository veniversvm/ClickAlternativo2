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
  
  // 1. CONFIGURACIÓN DE ABORT (8 segundos de timeout)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const headers = new Headers(options.headers || {});
  
  // 2. GESTIÓN DE CONTENT-TYPE
  // Si no es FormData, enviamos JSON. Si es FormData, dejamos que el navegador ponga el boundary.
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // 3. MAGIA DEL SSR: REENVÍO DE TODAS LAS COOKIES
  if (isServer) {
    const event = getRequestEvent();
    const cookies = event?.request.headers.get("cookie");
    if (cookies) {
      headers.set("cookie", cookies);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
      credentials: "include", // Permite enviar y recibir admin_jwt y jwt
    });

    clearTimeout(timeoutId);

    // No Content (Logout, Delete)
    if (response.status === 204) return { success: true };

    // Manejo de Sesión No Válida
    if (response.status === 401 || response.status === 403) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      return { 
        error: true, 
        message: data.error || "Error en el servidor", 
        status: response.status 
      };
    }

    return data;
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === "AbortError") {
        console.error(`[API Timeout] ${url} excedió el tiempo límite`);
    } else {
        console.error(`[API Connection Failed] ${url}`);
    }
    return null; // Failsafe para que la UI no explote
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

// src/lib/api.ts - Añadir al final

export const adminApi = {
  // GESTIÓN DE STAFF
  getMe: () => request("/admin/me"),
  loginAdmin: (creds: any) => request("/auth/admin/login", { method: "POST", body: JSON.stringify(creds) }),
  logout: () => request("/auth/admin/logout", { method: "POST" }),
  
  // GESTIÓN DE ENTRADAS
  createEntry: (fd: FormData) => request("/admin/entries", { method: "POST", body: fd }),
  getEntryById: (id: string) => request(`/admin/entries/${id}`),
  updateEntry: (id: string, fd: FormData) => request(`/admin/entries/${id}`, { method: "PUT", body: fd }),
  deleteEntry: (id: string) => request(`/admin/entries/${id}`, { method: "DELETE" }),

  // GESTIÓN DE CATEGORÍAS
  createCategory: (data: any) => request("/admin/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: number, data: any) => request(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCategory: (id: number) => request(`/admin/categories/${id}`, { method: "DELETE" }),

  // SUPER-ADMIN
  listAdmins: () => request("/admin/management/users"),
  createAdmin: (data: any) => request("/admin/management/users", { method: "POST", body: JSON.stringify(data) })
};