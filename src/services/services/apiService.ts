interface UserFromAPI {
    name: string;
    document_id: string;
    email: string;
    phone_number: string;
    role_id: number;
    cargo: string;
}

export interface UserTransformed {
    name: string;
    document_id: string;
    email: string;
    phone_number: string;
    role: string;
    cargo: string;
}

interface ApiResponse {
    users: UserFromAPI[];
    data: UserFromAPI[];
}

const API_URL = import.meta.env.VITE_API_URL

export async function get_users(): Promise<UserTransformed[]> {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No hay token de autenticación disponible.");
    }

    const res = await fetch(`${API_URL}/users`, {
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
        usersRaw = responseData as UserFromAPI[];
    } else if (responseData && Array.isArray(responseData.users)) {
        usersRaw = responseData.users;
    } else if (responseData && Array.isArray(responseData.data)) {
        usersRaw = responseData.data;
    } else {
        throw new Error("El servidor devolvió un formato de datos inválido.");
    }

    const usersTransformed: UserTransformed[] = usersRaw.map(user => {
        let roleName: string;

        switch (user.role_id) {
            case 1:
                roleName = "Administrador";
                break;
            case 2:
                roleName = "Empleado";
                break;
            default:
                roleName = "Desconocido";
        }

        return {
            name: user.name,
            document_id: user.document_id,
            email: user.email,
            phone_number: user.phone_number,
            cargo: user.cargo,
            role: roleName,
        };
    });

    return usersTransformed;
}