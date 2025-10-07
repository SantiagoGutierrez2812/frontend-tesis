import type { Proveedor } from "../types/supplier_interface";

const API_URL = import.meta.env.VITE_API_URL

export async function getSuppliers(): Promise<Proveedor[]> {

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/suppliers/`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
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
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/suppliers/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(supplier),
    },);

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error en login");
    }

    if (!res.ok) throw new Error("Error al crear proveedor");
    return await res.json();
}

export async function updateSupplier(id: number, supplier: Proveedor): Promise<Proveedor> {

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/suppliers/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
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
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/suppliers/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
        throw new Error("No se pudo eliminar el proveedor. Código: " + res.status);
    }

    return true;
}