import type { inventory_material_record } from "../types/inventory/inventory";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export async function get_read_from(branchId?: number): Promise<inventory_material_record[]> {
  let endpoint = "/inventories/";

  // Agregar parámetro branch_id si se proporciona
  if (branchId !== undefined) {
    endpoint += `?branch_id=${branchId}`;
  }

  const res = await fetchWithAuth(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    requiresAuth: false, // Endpoint público
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
