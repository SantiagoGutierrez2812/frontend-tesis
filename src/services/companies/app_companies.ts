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
export async function getCompanyName(): Promise<CompaniesResponse> {
    const res = await fetch("http://127.0.0.1:5000/companies", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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