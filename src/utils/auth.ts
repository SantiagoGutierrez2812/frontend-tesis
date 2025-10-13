
export const isLoggedIn = (): boolean => {
    const t = localStorage.getItem("token");
    // 1. Si el token es null (no existe), retorna false
    if (!t) return false; 
    
    // 2. Si el token es una cadena vacía o una cadena no deseada (ej: "null" o "undefined")
    if (t === "null" || t === "undefined" || t.trim() === "") return false;
    
    return true;
};

/**
 * Obtiene y parsea el rol del usuario desde localStorage.
 * Retorna el rol como número o null si no existe o es inválido.
 */
export const getRole = (): number | null => {
    const r = localStorage.getItem("role");
    
    if (!r) return null;
    
    // Convertimos la cadena de rol a número.
    const n = Number(r); 
    
    // Si la conversión resulta en NaN (No es un número), retorna null.
    return Number.isNaN(n) ? null : n;
};

/**
 * Elimina la información de sesión de localStorage.
 */
export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("welcome"); // Opcional: remover cualquier otro dato de sesión
    localStorage.removeItem("branch_id"); // Opcional: remover cualquier otro dato de sesión
};