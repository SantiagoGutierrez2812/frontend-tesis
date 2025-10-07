import type { UserFromAPI, UserTransformed, ApiResponse,NewUserPayload } from "../types/types";


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
    document_id: Number(user.document_id),
    email: user.email,
    phone_number: Number(user.phone_number),
    cargo: user.cargo,
    role:
      user.role_id === 1
        ? "Administrador"
        : user.role_id === 2
          ? "Empleado"
          : "Desconocido",
    branch_id: 3,
    deleted_at: user.deleted_at, 
  }));

}

export async function get_userss() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No hay token de autenticación.");

    const res = await fetch("http://127.0.0.1:5000/users", {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

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

    console.log(`Intentando DELETE a: ${url}`);
    
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

    console.log(`Intentando UPDATE a: ${url}`, payload);

    const res = await fetch(url, {
        method: "PUT", // o "PATCH" según tu API
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
