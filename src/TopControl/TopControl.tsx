import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import "./TopControl.css";

interface TopControlProps {
    title?: string;
    onBack?: () => void;
    onLogout?: () => void;
}

export default function TopControl({ title = "Panel", onBack, onLogout }: TopControlProps) {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            logout();
            navigate("/");
        }
    };
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };
    return (
        <>
            <div className="top-control">
                <button className="top-btn back" onClick={handleBack}>
                    ⬅
                </button>
                <h2 className="top-title">{title}</h2>
                <button className="top-btn menu" onClick={() => setMenuOpen(!menuOpen)}>
                    ☰
                </button>
            </div>

            {menuOpen && (
                <div className="top-menu-overlay">
                    <div className="menu-content">
                        <button onClick={() => setMenuOpen(false)}>❌ Cerrar</button>
                        <button onClick={() => alert("⚙ Configuración")}>⚙ Configuración</button>
                        <button onClick={() => alert("👤 Perfil")}>👤 Perfil</button>
                        <button onClick={handleLogout}>🚪 Salir</button>
                    </div>
                </div>
            )}
        </>
    );
}