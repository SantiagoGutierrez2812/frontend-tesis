import type { Transaction } from "../types/Product_Transactions/transaction";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export type CreateTransactionData = {
  description: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  transaction_date: string;
  product_id: number;
  branch_id: number;
  transaction_type_id: number;
  app_user_id: number;
};

interface TransactionsResponse {
  ok: boolean;
  product_transactions?: Transaction[];
  error?: string;
}

interface CreateTransactionResponse {
  ok: boolean;
  product_transaction?: Transaction;
  error?: string;
}

/**
 * Obtiene todas las transacciones del backend
 */
export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetchWithAuth("/product-transactions/", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error(`Error HTTP al obtener transacciones: ${res.status}`);

  const result: TransactionsResponse = await res.json();

  if (!result.ok) throw new Error(result.error || "Error desconocido del backend");

  return Array.isArray(result.product_transactions)
    ? result.product_transactions
    : [];
}

/**
 * Crea una nueva transacción
 */
export async function createTransaction(data: CreateTransactionData): Promise<Transaction> {
  const res = await fetchWithAuth("/product-transactions/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = `Error HTTP ${res.status}`;
    try {
      const errorData = await res.json();
      console.error("Error del backend:", errorData);
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // Si no se puede parsear el JSON, usar mensaje genérico
    }
    throw new Error(errorMessage);
  }

  const result: CreateTransactionResponse = await res.json();
  if (!result.ok) throw new Error(result.error || "Error desconocido del backend");
  if (!result.product_transaction) throw new Error("No se devolvió la transacción creada");

  return result.product_transaction;
}
