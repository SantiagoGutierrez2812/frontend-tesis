import type { UserFromAPI, UserTransformed, ApiResponse, NewUserPayload } from "../types/types";


// La URL de la API se asume local si no usa VITE_API_URL
// const API_URL = import.meta.env.VITE_API_URL 


export async function get_users(): Promise<UserTransformed[]> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No hay token de autenticación disponible.");

    const res = await fetch("http://127.0.0.1:5000/users", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
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
        usersRaw = responseData.users;
    } else if (responseData && Array.isArray(responseData.data)) {
        usersRaw = responseData.data;
    } else {
        throw new Error("El servidor devolvió un formato de datos inválido.");
    }

    return usersRaw.map((user) => ({
        name: user.name,
        username: user.username,
        // Transformamos a String, pero asegurando la existencia del dato
        document_id: String(user.document_id ?? ""), 
        email: user.email,
        phone_number: String(user.phone_number ?? ""), 
        cargo: user.cargo,
        // Usamos el ID de rol, el componente lo mapea a nombre
        role: String(user.role_id), 
        // ¡CORREGIDO! Usamos el valor real de la API
        branch_id: user.branch_id, 
        deleted_at: user.deleted_at, 
    }));
}

// Nota: get_userss ha sido comentado por redundancia.


export async function post_user(user: NewUserPayload): Promise<Response> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No hay token de autenticación disponible.");

    const res = await fetch("http://127.0.0.1:5000/user_registration", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al registrar usuario");
    }

    return res;
}

export async function delete_user(documentId :string) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No hay token de autenticación. Inicia sesión primero.");
    }

    const url = `http://127.0.0.1:5000/user/${documentId}?eliminate=true`;
    
    const res = await fetch(url, {
        method: "DELETE",
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });

    if (!res.ok) {
        let errorBody = "Error desconocido al eliminar el usuario.";
        try {
            errorBody = await res.text();
        } catch (e) {
            
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
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No hay token de autenticación. Inicia sesión primero.");
    }

    const url = `http://127.0.0.1:5000/user/${documentId}`;

    const res = await fetch(url, {
        method: "PUT", 
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        let errorBody = "Error desconocido al actualizar el usuario.";
        try {
            errorBody = await res.text();
        } catch (e) {}
        throw new Error(`Error ${res.status}: ${errorBody}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }

    return { message: "Usuario actualizado con éxito" };
}