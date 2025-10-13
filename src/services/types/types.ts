
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

export interface UserFromAPI {
    name: string;
    username: string;
    document_id: string | number;
    email: string;
    phone_number: string | number;
    cargo: string;
    role_id: number;
    deleted_at: string | null;
    branch_id: number | string | null; 
}


export interface PersonalData {
    name: string;
    document_id: string; 
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

export interface ApiResponse {
    users?: UserFromAPI[];
    data?: UserFromAPI[];
}