import type { Branch, BranchesResponse } from "../types/branch/branchService"; 

const API_URL = import.meta.env.VITE_API_URL 

export async function getBranches(): Promise<Branch[]> {
    const endpoint = `${API_URL}/branches/`; 

    const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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