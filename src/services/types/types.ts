// src/types/types.ts

// 1. Tipo para el ítem de inventario tal como lo devuelve la API
export interface Inventory {
    product_name: string;
    quantity: number;
    branch_id: number;
    product_size: string;
}

export interface InventoriesResponse {
    ok: boolean;
    inventories: Inventory[];
}

export interface InventoryDisplayItem {
    nombre: string;
    cantidad: number;
    tamaño: string;
}

// Interfaz para los datos crudos que vienen de su API (get_users)
export interface UserFromAPI {
    name: string;
    username: string;
    document_id: string | number;
    email: string;
    phone_number: string | number;
    cargo: string;
    role_id: number;
    deleted_at: string | null;
    // CLAVE: ESTE CAMPO ES NECESARIO para que el componente muestre la sucursal
    branch_id: number | string | null; 
}

// Interfaz para el objeto transformado (usado al salir de get_users)
export interface UserTransformed {
    branch_id: number | string | null | undefined; 
    name: string;
    document_id: string; // Lo transformamos a string
    email: string;
    phone_number: string; // Lo transformamos a string
    role: string; // Contiene el ID de rol (como string)
    cargo: string;
    username: string;
    deleted_at: string | null;
}

// La interfaz final que usa el estado `records` en el componente
export interface PersonalData {
    name: string;
    document_id: string; // String para el campo de formulario y tabla
    email: string;
    phone_number: string; // String para el campo de formulario y tabla
    cargo: string;
    role: string;
    direccion: string;
    fechaIngreso: string;
    password: string;
    username: string;
    branch_id: string; // ID de la sucursal (como string)
}

// Payload de registro
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