// src/types/types.ts

// 1. Tipo para el ítem de inventario tal como lo devuelve la API
export interface Inventory {
  product_name: string;
  quantity: number;
  branch_id: number; 
  product_size: string; // Incluido para que el componente Headquarters lo pueda mapear
}

// 2. Tipo para la respuesta COMPLETA del endpoint /inventories
export interface InventoriesResponse {
  ok: boolean;
  inventories: Inventory[];
}

// 3. Tipo para los datos de inventario transformados (para usar en Headquarters.tsx)
export interface InventoryDisplayItem {
  nombre: string;
  cantidad: number;
  tamaño: string;
}