import type { UserTransformed } from "../types/user/user";

const API_URL = import.meta.env.VITE_API_URL;

export async function getCurrentUser(): Promise<UserTransformed> {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No hay token de autenticación");
    }

    const res = await fetch(`${API_URL}/user/me`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Error del servidor:", errorText);
        throw new Error(`Error al obtener el usuario actual. Status: ${res.status}`);
    }

    const data = await res.json();

    if (!data.ok) {
        throw new Error("El servidor respondió con error lógico.");
    }

    return data.user;
}

export async function updateUser(documentId: string, user: Partial<UserTransformed>, newPassword?: string): Promise<UserTransformed> {
    const token = localStorage.getItem("token");

    const body: any = { ...user };
    if (newPassword) {
        body.new_password = newPassword;
    }

    const res = await fetch(`${API_URL}/user/${documentId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al actualizar usuario");
    }

    return data.user;
}
