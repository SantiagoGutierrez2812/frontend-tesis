export interface Transaction {
  id: number;
  app_user_name?: string; 
  branch_name?: string;   
  created_at?: string;
  description?: string;
  product?: string;     
  quantity?: number;
  supplier_name?: string;
  total_price?: number;
  transaction_date?: string;
  transaction_type_name?: string; 
  unit_price?: number;
  app_user_id?: number; 
}

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

