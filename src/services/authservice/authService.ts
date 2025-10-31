// authService.ts

const API_URL = import.meta.env.VITE_API_URL;

// ----------------------------
// Tipos de respuesta del backend
// ----------------------------

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
    user_id: number;
    name?: string;
}

// ----------------------------
// Función: login
// ----------------------------
export async function login(username: string, password: string): Promise<InitialLoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        let errorMessage = "Credenciales inválidas o usuario no existe.";

        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
        } catch {
            try {
                errorMessage = await response.text() || `Error de servidor: ${response.status}.`;
            } catch {
                errorMessage = `Error HTTP: ${response.status}.`;
            }
        }

        throw new Error(errorMessage);
    }

    return response.json() as Promise<InitialLoginResponse>;
}

// ----------------------------
// Función: verifyOtp
// ----------------------------
export async function verifyOtp(username: string, token: string): Promise<LoginSuccessResponse> {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, token }), // siempre string
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
    const parsed = Array.isArray(data) ? data[0] : data;

    if (!parsed.access_token) {
        throw new Error("No se recibió token del servidor.");
    }

    // Guardar datos críticos en localStorage
    localStorage.setItem("token", parsed.access_token);
    localStorage.setItem("role", String(Number(parsed.role)));
    localStorage.setItem("welcome", parsed.username);
    if (parsed.branch_id) localStorage.setItem("branch_id", String(parsed.branch_id));
    if (parsed.user_id) localStorage.setItem("user_id", String(parsed.user_id));
    if (parsed.name) localStorage.setItem("user_name", parsed.name);

    return parsed as LoginSuccessResponse;
}



// ----------------------------
// Solicitar token de recuperación
// ----------------------------
export async function forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        let errorMessage = "No se pudo enviar el correo de recuperación.";
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
            errorMessage = `Error HTTP: ${response.status}`;
        }
        throw new Error(errorMessage);
    }

    return response.json();
}

// ----------------------------
// Verificar OTP del email para reset
// ----------------------------
export async function verifyOtpPassword(email: string, token: string): Promise<{ ok: boolean; message: string }> {
    const response = await fetch(`${API_URL}/auth/verify-otp-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }), // siempre string
    });

    if (!response.ok) {
        let errorMessage = "OTP inválido.";
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
            errorMessage = `Error HTTP: ${response.status}`;
        }
        throw new Error(errorMessage);
    }

    return response.json();
}

// ----------------------------
// Resetear contraseña con OTP
// ----------------------------
export async function resetPassword(
    email: string,
    token: string,
    newPassword: string,
    confirmPassword: string
): Promise<{ ok: boolean; message: string }> {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            token,
            new_password: newPassword,
            confirm_password: confirmPassword
        }),
    });

    if (!response.ok) {
        let errorMessage = "No se pudo resetear la contraseña.";
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
            errorMessage = `Error HTTP: ${response.status}`;
        }
        throw new Error(errorMessage);
    }

    return response.json();
}
