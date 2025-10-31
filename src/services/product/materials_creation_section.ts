import type { product_id_record } from "../types/product/product";

const API_URL = import.meta.env.VITE_API_URL;

export async function post_create_product(product: product_id_record) {
  try {
    const formattedProduct = {
      ...product,
      price: parseFloat(String(product.price)),
      is_active: product.is_active ?? true,
    };

    const token = localStorage.getItem("token");
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/products/`, {
      method: "POST",
      headers,
      body: JSON.stringify(formattedProduct),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.error) {
      throw new Error(responseData.error || `Error HTTP: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    throw error;
  }
}

export async function get_all_products(): Promise<product_id_record[]> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/products/`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Error HTTP: ${response.status}`);
  }

  const data = await response.json();
  // Suponemos que data es un array de productos
  return Array.isArray(data.products) ? data.products : [];
}

export async function delete_product(productId: number) {
  try {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Error al eliminar el producto (HTTP ${response.status})`);
    }

    return true;
  } catch (error) {
    throw error;
  }
}

export async function patch_product(productId: number, data: Partial<product_id_record>) {
  try {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const resData = await response.json().catch(() => ({}));
      throw new Error(resData.error || `Error al actualizar el producto (HTTP ${response.status})`);
    }

    return response.json();
  } catch (error) {
    throw error instanceof Error ? error : new Error("Error desconocido al actualizar el producto");
  }
}
