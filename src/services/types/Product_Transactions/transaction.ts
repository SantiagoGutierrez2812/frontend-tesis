export interface Transaction {
  id: number;
  app_user_name?: string; // <-- Agregado
  branch_name?: string;   // <-- Agregado
  created_at?: string;
  description?: string;
  product?: string;       // <-- Agregado
  quantity?: number;
  supplier_name?: string;
  total_price?: number;
  transaction_date?: string;
  transaction_type_name?: string; // <-- Agregado
  unit_price?: number;
  app_user_id?: number; // si también lo usas
}


// Define el tipo de datos para crear la transacción
export type CreateTransactionData = {
  description: string;
  quantity: number;
  unit_price: number;
  transaction_date: string; // formato "YYYY-MM-DD"
  product_id: number;
  branch_id: number;
  transaction_type_id: number;
  app_user_id: number;
};
