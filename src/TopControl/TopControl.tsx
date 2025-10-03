import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import "./TopControl.css";

export interface MenuOption {
  label: string;
  icon?: string;
  onClick?: () => void; // acción dinámica
}

interface TopControlProps {
  title?: string;
  options?: MenuOption[]; // 👈 opciones que recibe cada vista
}

export default function TopControl({ title = "Panel", options = [] }: TopControlProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleBack = () => {
    navigate(-1);
  };


  const defaultOptions: MenuOption[] = [
    { label: "⬅ Regresar", onClick: handleBack },
    { label: "🚪 Cerrar Sesión", onClick: handleLogout },
  ];


  const finalOptions = [...options, ...defaultOptions];

  return (
    <>
      <div className="top-control">
        <h2 className="top-title">{title}</h2>
        <button className="top-btn menu" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="top-menu-overlay">
          <div className="menu-content">
            <button onClick={() => setMenuOpen(false)}>❌ Cerrar Menú</button>
            {finalOptions.map((opt, i) => (
              <button
                key={i}
                onClick={async () => {
                  setMenuOpen(false);
                  if (opt.onClick) await opt.onClick(); 
                }}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
