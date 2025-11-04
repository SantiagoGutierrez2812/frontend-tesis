// services/log/log.ts
import type { LogRecord } from "../types/log/log";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export async function get_all_logs(): Promise<LogRecord[]> {
  try {
    const response = await fetchWithAuth("/logs", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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
