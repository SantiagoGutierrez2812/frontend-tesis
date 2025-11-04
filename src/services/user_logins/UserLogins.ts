import type { UserLogin, AppUser } from "../types/user_logins/UserLogin";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export async function getUserLogins(): Promise<UserLogin[]> {
  const res = await fetchWithAuth("/user-logins/");

  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error desconocido");

  return data.users_logins || [];
}

export async function getAppUsers(): Promise<AppUser[]> {
  const res = await fetchWithAuth("/user-logins/");

  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error desconocido");

  return data.users_logins || [];
}
