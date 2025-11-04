import type { Branch, BranchesResponse } from "../types/branch/branchService";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export async function getBranches(): Promise<Branch[]> {
    const res = await fetchWithAuth("/branches/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        requiresAuth: false, // Esta API puede no requerir auth, mantener el comportamiento anterior
    });

    if (!res.ok) {
        throw new Error(`Error al obtener sedes. Status: ${res.status}`);
    }

    const result: BranchesResponse = await res.json();

    if (!result.ok || !result.branches) {
        throw new Error("La API devolvió un estado 'ok: false' o no hay lista de sedes.");
    }

    return result.branches;
}