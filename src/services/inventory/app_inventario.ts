export interface Inventory {
  product_name: string;
  quantity: number;
  branch_id: number; 
}

export interface InventoriesResponse {
  ok: boolean;
  inventories: Inventory[];
}

export async function getInventories(): Promise<InventoriesResponse> {
  const res = await fetch("http://127.0.0.1:5000/inventories/", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Error al obtener inventarios");
  }

  return res.json();
}
