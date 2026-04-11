// src/lib/api.ts

// Detectar si estamos en el servidor (Docker) o en el cliente (Browser)
const isServer = typeof window === "undefined";
const API_URL = isServer 
  ? (process.env.DOCKER_ENV ? "http://click_api:8080/api/v1" : "http://localhost:8080/api/v1")
  : "http://localhost:8080/api/v1";

/**
 * Helper para peticiones seguras con timeout y abort
 */
async function safeFetch(url: string, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      // Importante para enviar las HttpOnly Cookies
      credentials: isServer ? "include" : "same-origin"
    });
    
    clearTimeout(id);

    if (!response.ok) {
      console.error(`[API Error] ${response.status} en ${url}`);
      return null;
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      console.error(`[API Timeout] La petición a ${url} excedió los ${timeout}ms`);
    } else {
      console.error(`[API Connection Failed] No se pudo conectar a ${url}`);
    }
    return null; // Failsafe: devolvemos null en lugar de romper la app
  }
}

export async function fetchEntries(category = "", page = 1, search = "") {
  const url = new URL(`${API_URL}/entries`);
  url.searchParams.set("page", page.toString());
  if (category) url.searchParams.set("tag", category);
  if (search) url.searchParams.set("search", search);

  const data = await safeFetch(url.toString());
  
  // Failsafe: Si la API falla, devolvemos estructura vacía para que el .map() no rompa
  return data || { results: [], page: 1, limit: 20 };
}

export async function fetchEntryDetail(slug: string) {
  const data = await safeFetch(`${API_URL}/entries/${slug}`);
  return data || null;
}