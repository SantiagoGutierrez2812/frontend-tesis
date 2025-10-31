import type { inventory_material_record } from "../types/inventory/inventory";

const API_URL = import.meta.env.VITE_API_URL;

export async function get_read_from(branchId?: number): Promise<inventory_material_record[]> {
  let endpoint = `${API_URL}/inventories/`;

  // Agregar parámetro branch_id si se proporciona
  if (branchId !== undefined) {
    endpoint += `?branch_id=${branchId}`;
  }

  const token = localStorage.getItem("token");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    method: "GET",
    headers,
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
