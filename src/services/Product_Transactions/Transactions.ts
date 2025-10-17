import type { Transaction } from "../types/Product_Transactions/transaction";

const API_URL = import.meta.env.VITE_API_URL;

export type CreateTransactionData = {
  description: string;
  quantity: number;
  unit_price: number;
  total_price?: number; // <-- agregar
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
  const endpoint = `${API_URL}/product-transactions`;
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token de autenticación en localStorage.");

  const res = await fetch(endpoint, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Error HTTP al obtener transacciones: ${res.status}`);

  const result: TransactionsResponse = await res.json();

  if (!result.ok) throw new Error(result.error || "Error desconocido del backend");

  // Aseguramos que sea un array
  return Array.isArray(result.product_transactions)
    ? result.product_transactions
    : [];
}

/**
 * Crea una nueva transacción
 */
export async function createTransaction(data: CreateTransactionData): Promise<Transaction> {
  const endpoint = `${API_URL}/product-transactions`;
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token de autenticación en localStorage.");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(`Error HTTP al crear transacción: ${res.status}`);

  const result: CreateTransactionResponse = await res.json();
  if (!result.ok) throw new Error(result.error || "Error desconocido del backend");
  if (!result.product_transaction) throw new Error("No se devolvió la transacción creada");

  return result.product_transaction;
}
