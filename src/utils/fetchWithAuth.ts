/**
 * Wrapper de fetch que maneja automáticamente la expiración del JWT
 * y redirige al usuario a la página de login cuando el token expira.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface FetchWithAuthOptions extends RequestInit {
  requiresAuth?: boolean; // Si es false, no agrega el token ni verifica 401
}

/**
 * Realiza una petición HTTP con autenticación automática
 * @param url - URL relativa o completa
 * @param options - Opciones de fetch + requiresAuth
 * @returns Promise con la respuesta
 */
export async function fetchWithAuth(
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const { requiresAuth = true, ...fetchOptions } = options;

  // Construir URL completa si es relativa
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  // Si requiere autenticación, agregar el token
  if (requiresAuth) {
    const token = localStorage.getItem("token");

    if (!token) {
      // No hay token, redirigir al login
      handleAuthError();
      throw new Error("No hay token de autenticación disponible.");
    }

    // Agregar Authorization header
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  // Realizar la petición
  const response = await fetch(fullUrl, fetchOptions);

  // Si la respuesta es 401 (Unauthorized), el JWT expiró
  if (response.status === 401 && requiresAuth) {
    handleAuthError();
    throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
  }

  return response;
}

/**
 * Maneja el error de autenticación:
 * - Limpia el localStorage
 * - Redirige al usuario a la página de login
 */
function handleAuthError(): void {
  // Limpiar datos de sesión
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("welcome");
  localStorage.removeItem("branch_id");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_name");

  // Redirigir a la página de login
  window.location.href = "/";
}

/**
 * Variante de fetchWithAuth que parsea automáticamente JSON
 * y maneja errores de manera más conveniente
 */
export async function fetchJsonWithAuth<T = any>(
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<T> {
  const response = await fetchWithAuth(url, options);

  if (!response.ok) {
    let errorMessage = `Error HTTP: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      try {
        errorMessage = await response.text() || errorMessage;
      } catch {
        // Si no se puede leer el error, usar el mensaje por defecto
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
