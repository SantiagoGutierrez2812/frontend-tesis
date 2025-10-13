import type { inventory_material_record } from "../types/inventory/inventory";

const API_URL = import.meta.env.VITE_API_URL;

export async function get_read_from(): Promise<inventory_material_record[]> {
  const endpoint = `${API_URL}/inventories/`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Error al obtener inventarios. Status: ${res.status}`);
  }

  const data = await res.json();

  if (data && Array.isArray(data.inventories)) {
    return data.inventories;
  }

  console.warn("Estructura de respuesta inesperada:", data);
  return [];
}
