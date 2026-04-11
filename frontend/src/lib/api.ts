const isServer = typeof window === "undefined";
const API_URL = isServer
  ? (process.env.DOCKER_ENV ? "http://click_api:8080/api/v1" : "http://localhost:8080/api/v1")
  : "http://localhost:8080/api/v1";

// Cancela la petición anterior si se hace una nueva antes de que termine
let currentController: AbortController | null = null;

async function safeFetch(url: string, timeout = 5000, signal?: AbortSignal) {
  const controller = new AbortController();

  // Combinamos la señal externa (abort por navegación) con el timeout interno
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Si viene una señal externa (ej: el componente se desmonta), la escuchamos
  signal?.addEventListener("abort", () => controller.abort());

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      credentials: isServer ? "include" : "same-origin",
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[API Error] ${response.status} en ${url}`);
      return null;
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.error(`[API Aborted] ${url}`);
    } else {
      console.error(`[API Connection Failed] No se pudo conectar a ${url}`);
    }
    return null;
  }
}

export async function fetchEntries(
  category = "",
  page = 1,
  search = "",
  signal?: AbortSignal
) {
  // Cancela la petición anterior si todavía estaba en vuelo
  if (currentController) {
    currentController.abort();
  }
  currentController = new AbortController();

  // Fusionamos la señal del caller con la nuestra
  const combinedSignal = signal ?? currentController.signal;

  const url = new URL(`${API_URL}/entries`);
  url.searchParams.set("page", page.toString());
  if (category) url.searchParams.set("tag", category);
  if (search) url.searchParams.set("search", search);

  const data = await safeFetch(url.toString(), 5000, combinedSignal);

  if (!data) {
    return { results: [], page: 1, limit: 20, error: true };
  }

  return { ...data, error: false };
}

export async function fetchEntryDetail(slug: string, signal?: AbortSignal) {
  const data = await safeFetch(`${API_URL}/entries/${slug}`, 5000, signal);
  return data || null;
}