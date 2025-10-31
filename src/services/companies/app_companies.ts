export interface Company {
    id: number;
    name: string;
    nit: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CompaniesResponse {
    ok: boolean;
    companies: Company[];
}

const API_URL = import.meta.env.VITE_API_URL

export async function getCompanyName(): Promise<CompaniesResponse> {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/companies`, {
        method: "GET",
        headers,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al obtener las empresas");
    }

    const responseData = await res.json();


    if (responseData && Array.isArray(responseData.companies)) {
        return responseData as CompaniesResponse;
    }

    if (Array.isArray(responseData)) {
        return { ok: true, companies: responseData as Company[] };
    }

    throw new Error("Formato de respuesta de empresas inesperado.");
}