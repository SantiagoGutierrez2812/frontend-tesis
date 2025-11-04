import type { UserFromAPI, ApiResponse } from "../types/types";
import type { UserTransformed, NewUserPayload } from "../types/user/user";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

// --- Funciones del API Service ---

export async function get_users(): Promise<UserTransformed[]> {
    const res = await fetchWithAuth("/users", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al obtener la lista de usuarios");
    }

    const responseData: ApiResponse | UserFromAPI[] = await res.json();
    let usersRaw: UserFromAPI[];

    if (Array.isArray(responseData)) {
        usersRaw = responseData;
    } else if (responseData && Array.isArray(responseData.users)) {
        // Formato de respuesta del backend es { ok: true, users: [...] }
        usersRaw = responseData.users;
    } else if (responseData && Array.isArray(responseData.data)) {
        usersRaw = responseData.data;
    } else {
        throw new Error("El servidor devolvió un formato de datos inválido.");
    }

    return usersRaw.map((user) => ({
        name: user.name,
        username: user.username,
        document_id: String(user.document_id ?? ""), 
        email: user.email,
        phone_number: String(user.phone_number ?? ""), 
        // @ts-ignore
        cargo: user.cargo, // Asegúrate de que 'cargo' exista en UserFromAPI
        role: String(user.role_id), 
        branch_id: String(user.branch_id ?? ""), // Asegurar que es string para PersonalData en VisualStaff
        deleted_at: user.deleted_at, 
    }));
}


export async function post_user(user: NewUserPayload): Promise<Response> {
    const res = await fetchWithAuth("/user_registration", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al registrar usuario");
    }

    return res;
}

export async function delete_user(documentId: string) {
    const res = await fetchWithAuth(`/user/${documentId}?eliminate=true`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (!res.ok) {
        let errorBody = "Error desconocido al eliminar el usuario.";
        try {
            errorBody = await res.text();
        } catch (e) {
            // Ignorar error al leer respuesta
        }
        throw new Error(`Error ${res.status}: ${errorBody}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }
    return { message: "Usuario eliminado con éxito" };
}


export async function update_user(documentId: string, payload: any) {
    const res = await fetchWithAuth(`/user/${documentId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        let errorBody = "Error desconocido al actualizar el usuario.";
        try {
            errorBody = await res.text();
        } catch (e) {
            // Ignorar error al leer respuesta
        }
        throw new Error(`Error ${res.status}: ${errorBody}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }

    return { message: "Usuario actualizado con éxito" };
}