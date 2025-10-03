// src/services/inventoryService.ts

// 🚨 CORRECCIÓN: Ajusta la ruta a tu archivo de tipos según la ubicación
import type { InventoriesResponse, Inventory, InventoryDisplayItem } from '../types/types'; 

const API_BASE_URL = "http://127.0.0.1:5000";

/**
 * Función que realiza la llamada cruda al endpoint de inventarios.
 * @returns {Promise<InventoriesResponse>} La respuesta completa (ok, inventories).
 * @throws {Error} Si la respuesta HTTP no es satisfactoria.
 */
export async function getInventories(): Promise<InventoriesResponse> {
  const endpoint = `${API_BASE_URL}/inventories/`;
  
  const res = await fetch(endpoint, { 
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    // Incluye el estado HTTP en el error para facilitar la depuración
    throw new Error(`Error al obtener inventarios. Status: ${res.status}`);
  }

  return res.json();
}

/**
 * Función principal para obtener y transformar los datos de inventario para la visualización.
 * @returns {Promise<InventoryDisplayItem[]>} Los datos transformados listos para el componente.
 */
export async function fetchAndTransformInventories(): Promise<InventoryDisplayItem[]> {
    const result: InventoriesResponse = await getInventories();
    
    // Si la API responde con ok: false, también lanzamos un error
    if (!result.ok) {
        throw new Error("La API devolvió un estado 'ok: false'.");
    }

    // Transformación de la respuesta de la API (Inventory) al formato de visualización (InventoryDisplayItem)
    const transformedData: InventoryDisplayItem[] = result.inventories.map((item: Inventory) => ({
        nombre: item.product_name,
        cantidad: item.quantity,
        tamaño: item.product_size, 
    }));

    return transformedData;
}