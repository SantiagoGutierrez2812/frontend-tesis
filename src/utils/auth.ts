export const isLoggedIn = (): boolean => {
    const t = localStorage.getItem("token");
    if (!t) return false;
    if (t === "null" || t === "undefined" || t.trim() === "") return false;
    return true;
};

export const getRole = (): number | null => {
    const r = localStorage.getItem("role");
    if (!r) return null;
    const n = Number(r);
    return Number.isNaN(n) ? null : n;
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
};
