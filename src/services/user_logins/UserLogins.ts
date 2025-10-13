import type { UserLogin, AppUser } from "../types/user_logins/UserLogin";

const API_URL = import.meta.env.VITE_API_URL;

export async function getUserLogins(): Promise<UserLogin[]> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token en localStorage");

  const res = await fetch(`${API_URL}/user-logins/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error desconocido");

  return data.users_logins || [];
}

// *** FUNCIÓN CORREGIDA: Resuelve el error 404 ***
// Dado que la ruta /app-user/ no existe, apuntamos esta llamada a /user-logins/ 
// para obtener los datos que se utilizarán para el mapeo.
export async function getAppUsers(): Promise<AppUser[]> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token en localStorage");

  const res = await fetch(`${API_URL}/user-logins/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error desconocido");

  // CORRECCIÓN: usar el campo correcto
  return data.users_logins || []; 
}
