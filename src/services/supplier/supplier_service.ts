import type { Proveedor } from "../types/supplier_interface";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export async function getSuppliers(): Promise<Proveedor[]> {
    const res = await fetchWithAuth("/suppliers/", {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!res.ok) {
        throw new Error(`Error al obtener los proveedores. Status: ${res.status}`)
    }

    const data = await res.json();

    if (!data.ok) {
        throw new Error("El servidor respondió con error lógico.");
    }

    return data.suppliers;
}

export async function createSupplier(supplier: Proveedor) {
    const res = await fetchWithAuth("/suppliers/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(supplier),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al crear proveedor");
    }

    return data;
}

export async function updateSupplier(id: number, supplier: Proveedor): Promise<Proveedor> {
    const res = await fetchWithAuth(`/suppliers/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(supplier),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al actualizar proveedor");
    }

    return data.supplier;
}

export async function deleteSupplier(id: number) {
    const res = await fetchWithAuth(`/suppliers/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        }
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
        throw new Error("No se pudo eliminar el proveedor. Código: " + res.status);
    }

    return true;
}