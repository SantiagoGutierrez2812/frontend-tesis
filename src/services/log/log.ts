// services/log/log.ts
import type { LogRecord } from "../types/log/log";

const API_URL = import.meta.env.VITE_API_URL;

export async function get_all_logs(): Promise<LogRecord[]> {
  if (!API_URL) {
    console.error("VITE_API_URL no está definido. Revisa tu archivo .env");
    return [];
  }

  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("⚠️ No hay token. No se puede acceder a los logs.");
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/logs`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Error HTTP al obtener logs. Estado:", response.status);
      return [];
    }

    const data = await response.json();

    let logsArray: LogRecord[] = [];
    if (Array.isArray(data.logs)) {
      logsArray = data.logs;
    } else if (Array.isArray(data)) {
      logsArray = data;
    } else {
      console.warn("Respuesta del backend inesperada:", data);
      return [];
    }

    return logsArray;

  } catch (err) {
    console.error("Error de red (fetch falló) al obtener logs:", err);
    return [];
  }
}
