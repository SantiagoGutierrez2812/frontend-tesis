
export interface Inventory {
  product_name: string;
  quantity: number;
}

export interface InventoriesResponse {
  ok: boolean;
  inventories: Inventory[];
}
