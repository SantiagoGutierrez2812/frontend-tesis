export interface inventory_material_record {
    id: number;
    branch : number;
    product_name:string;
    product_size:string;
    price: string;
    quantity: number;
    product_id:  number;
    created_at:string;
}

export interface InventoriesResponse {
  data: inventory_material_record[];
  message: string;
  success: boolean;
}
export interface InventoryApiResponse {
    inventories: inventory_material_record[];
    ok: boolean;
}