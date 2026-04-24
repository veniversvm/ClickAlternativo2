import { getRequestEvent } from "solid-js/web";

const isServer = typeof window === "undefined";

// --- CONFIGURACIÓN DE URLS DINÁMICAS ---
// Si estamos en el navegador, usamos localhost.
// Si estamos en el servidor Bun:
//   - En Docker usamos SERVER_API_URL (http://click_api:8080)
//   - En local (bun dev) usamos la misma URL del cliente (http://localhost:8080)
const PUBLIC_API =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
const SERVER_API = isServer
  ? process.env.SERVER_API_URL || PUBLIC_API
  : PUBLIC_API;

export const API_BASE_URL = isServer ? SERVER_API : PUBLIC_API;

/**
 * Motor de peticiones con reenvío de Cookies (SSR) y Failsafe
 */
async function request(
  endpoint: string,
  options: RequestInit = {},
  retries = 2,
) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (isServer) {
    const event = getRequestEvent();
    const cookies = event?.request.headers.get("cookie");
    if (cookies) headers.set("cookie", cookies);
  }

  // Bucle de reintentos
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        credentials: "include",
      });

      clearTimeout(timeoutId);

      if (response.status === 204) return { success: true };
      if (response.status === 401 || response.status === 403) return null;

      // REGLA SENIOR: Si es 404, no reintentes, devuelve null inmediatamente
      if (response.status === 404) return null;

      // Si es un error de servidor (500, 502, 503, 504) y nos quedan reintentos...
      if (response.status >= 500 && i < retries) {
        console.warn(`[API Retry ${i+1}] Error ${response.status} en ${url}. Reintentando...`);
        const delay = Math.pow(2, i) * 200; // Espera 200ms, luego 400ms...
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const data = await response.json();
      if (!response.ok) {
        return { error: true, message: data.error || "Error", status: response.status };
      }

      return data;

    } catch (e: any) {
      clearTimeout(timeoutId);
      
      const isTimeout = e.name === "AbortError";
      
      // Si aún tenemos intentos, esperamos y continuamos el bucle
      if (i < retries) {
        const logMsg = isTimeout ? "Timeout" : "Fallo de conexión";
        console.warn(`[API Retry ${i+1}] ${logMsg} en ${url}. Reintentando...`);
        await new Promise(r => setTimeout(r, 300));
        continue;
      }

      // Si llegamos aquí, se agotaron los reintentos
      if (isTimeout) {
        console.error(`[API FATAL] Timeout definitivo en ${url} tras ${retries} reintentos`);
      } else {
        console.error(`[API FATAL] Error de red definitivo en ${url}`);
      }
      
      return null; // Failsafe final
    }
  }
}

// --- MÓDULOS DE API ---

export const blogApi = {
  getPaginated: async (category = "", page = 1, search = "") => {
    const params = new URLSearchParams({
      page: page.toString(),
      tag: category || "",
      search: search || "",
    });
    const data = await request(`/entries?${params.toString()}`);
    return data || { results: [], page: 1, limit: 20, error: true };
  },

  getBySlug: async (slug: string) => {
    return await request(`/entries/${slug}`);
  },

  getCategories: () => request("/categories"),

  getSitemapData: async () => {
    // Esta llamada ocurre mayormente en el servidor (SSR)
    return await request("/sitemap-data");
  }
};

export const authApi = {
  register: (userData: any) =>
    request("/auth/user/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials: any) =>
    request("/auth/user/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: () => request("/auth/user/logout", { method: "POST" }),

  getGoogleLoginUrl: () => `${API_BASE_URL}/auth/google/login`,
};

export const userApi = {
  getProfile: async () => {
    const data = await request("/user/profile");
    // Si Go devuelve un error de sesión, request() devuelve null automáticamente
    return data;
  },

  updateProfile: (data: {
    notify_email: boolean;
    notify_push: boolean;
    tag_ids: number[];
  }) => request("/user/profile", { method: "PUT", body: JSON.stringify(data) }),
};

// src/lib/api.ts - Añadir al final

export const adminApi = {
  // GESTIÓN DE STAFF
  getMe: () => request("/admin/me"),
  loginAdmin: (creds: any) =>
    request("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify(creds),
    }),
  logout: () => request("/auth/admin/logout", { method: "POST" }),

  // GESTIÓN DE ENTRADAS
  createEntry: (fd: FormData) =>
    request("/admin/entries", { method: "POST", body: fd }),
  getEntryById: (id: string) => request(`/admin/entries/${id}`),
  updateEntry: (id: string, fd: FormData) =>
    request(`/admin/entries/${id}`, { method: "PUT", body: fd }),
  deleteEntry: (id: string) =>
    request(`/admin/entries/${id}`, { method: "DELETE" }),

  // GESTIÓN DE CATEGORÍAS
  createCategory: (data: any) =>
    request("/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCategory: (id: number, data: any) =>
    request(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: number) =>
    request(`/admin/categories/${id}`, { method: "DELETE" }),

  // SUPER-ADMIN
  listAdmins: () => request("/admin/management/users"),
  createAdmin: (data: any) =>
    request("/admin/management/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
