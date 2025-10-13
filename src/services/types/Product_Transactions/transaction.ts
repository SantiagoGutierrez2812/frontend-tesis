export interface Transaction {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  transaction_date: string;
  product_id: number;
  branch_id: number;
  transaction_type_id: number;
  app_user_id: number;
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
