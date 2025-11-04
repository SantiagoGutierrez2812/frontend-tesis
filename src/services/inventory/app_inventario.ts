import type { InventoriesResponse } from "../types/types";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export interface inventory_material_record {
  id: number;
  branch: number;
  product_name: string;
  product_size: string;
  price: string;
  quantity: number;
  product_id: number;
  created_at: string;
}

export async function getInventories(branchId?: number): Promise<InventoriesResponse> {
  let endpoint = "/inventories/";
  if (branchId) endpoint += `?branch_id=${branchId}`;

  const res = await fetchWithAuth(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    requiresAuth: false, // Endpoint público
  });

  if (!res.ok) throw new Error(`Error al obtener inventarios. Status: ${res.status}`);
  return res.json();
}

export async function fetchAndTransformInventories(branchId?: number): Promise<inventory_material_record[]> {
  const result: InventoriesResponse = await getInventories(branchId);
  if (!result.ok || !result.inventories) return [];

  return result.inventories.map((item: any) => ({
    id: item.id || 0,
    branch: Number(item.branch_id || item.branch || 0),
    product_name: item.nombre || item.product_name || "N/A",
    product_size: item.tamaño || item.product_size || "N/A",
    price: String(item.price || "0"),
    quantity: Number(item.cantidad || item.quantity || 0),
    product_id: item.product_id || 0,
    created_at: item.created_at || new Date().toISOString(),
  }));
}

export async function post_create_inventory(data: { product_id: number; branch_id: number; quantity: number }) {
    const payload = {
        product_id: data.product_id,
        branch_id: data.branch_id,
        cantidad: data.quantity
    };

  const response = await fetchWithAuth("/inventories/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }
  return response.json();
}
