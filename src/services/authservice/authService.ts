// authService.ts

const API_URL = import.meta.env.VITE_API_URL;

// Respuesta del primer paso: POST /auth/login
interface InitialLoginResponse {
    ok: boolean;
    message: string;
}

// Respuesta del segundo paso: POST /auth/verify-otp
export interface LoginSuccessResponse {
    token: string;
    role: number;
    branch_id: number;
    ok: boolean;
    message: string;
    username: string;
}


export async function login(username: string, password: string): Promise<InitialLoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        let errorData;
        let errorMessage = "Credenciales inválidas o usuario no existe.";
        
        try {
            errorData = await response.json();
            errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
        } catch (e) {
            try {
                errorMessage = await response.text() || `Error de servidor: ${response.status}.`;
            } catch (e) {
                errorMessage = `Error HTTP: ${response.status}.`;
            }
        }
        
        throw new Error(errorMessage);
    }

    return response.json() as Promise<InitialLoginResponse>; 
}

export async function verifyOtp(username: string, token: string): Promise<LoginSuccessResponse> {
    const API_URL = import.meta.env.VITE_API_URL; // 🔧 asegúrate de tener esto en tu .env
    const tokenAsNumber = parseInt(token, 10);
    const tokenToSend = isNaN(tokenAsNumber) ? token : tokenAsNumber;

    const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, token: tokenToSend }),
    });

    if (!response.ok) {
        let errorMessage = "Código de verificación inválido.";
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
            errorMessage = `Error HTTP: ${response.status}.`;
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();

    // 🧠 El backend devuelve un array: [ { datos }, 200 ]
    const parsed = Array.isArray(data) ? data[0] : data;

    // 🔥 Guarda los datos críticos en localStorage directamente aquí
    if (parsed.access_token) {
        localStorage.setItem("token", parsed.access_token);
        localStorage.setItem("role", String(Number(parsed.role))); // ✅ lo guardamos como número convertido a string
        localStorage.setItem("welcome", parsed.username);
        if (parsed.branch_id) localStorage.setItem("branch_id", String(parsed.branch_id));
    } else {
        throw new Error("No se recibió token del servidor.");
    }

    return parsed as LoginSuccessResponse;
}