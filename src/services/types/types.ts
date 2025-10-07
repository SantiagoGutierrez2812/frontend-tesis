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

export interface UserFromAPI {
  name: string;
  username: string;
  document_id: string | number; 
  email: string;
  phone_number: string | number;
  cargo: string;
  role_id: number;
  deleted_at: string | null; 
}

export interface UserTransformed {
  branch_id: any;
  name: string;
  document_id: string | number;
  email: string;
  phone_number: string | number;
  role: string;
  cargo: string;
  username: string;  
   deleted_at: string | null;
}


// src/services/types/types.ts
export interface PersonalData {
  name: string;
  document_id: number; 
  email: string;
  phone_number: string;
  cargo: string;
  role: string;
  direccion: string;
  fechaIngreso: string;
  password: string;
  username: string;
  branch_id: string;
}


export interface NewUserPayload {
  name: string;
  email: string;
  username: string;
  hashed_password: string; 
  document_id: number;   
  phone_number: number;
  role_id: number;
  branch_id: number;
}

export interface ApiResponse {
  users?: UserFromAPI[];
  data?: UserFromAPI[];
}
