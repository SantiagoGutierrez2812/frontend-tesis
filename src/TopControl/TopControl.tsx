import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import "./TopControl.css";

export interface MenuOption {
  label: string;
  icon?: string;
  onClick?: () => void;
}

interface TopControlProps {
  title?: string | React.ReactNode;
  options?: MenuOption[];
  onBackClick?: () => void;
}

export default function TopControl({ title = "Panel", options = [], onBackClick }: TopControlProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDefaultBack = () => {
    navigate(-1);
  };

  const handleBack = onBackClick || handleDefaultBack;


  const defaultOptions: MenuOption[] = [
    { label: "🚪 Cerrar Sesión", onClick: handleLogout },
  ];


  const finalOptions = [...options, ...defaultOptions];

  return (
    <>
      <div className="top-control">
        <button className="top-btn back-btn" onClick={handleBack} title="Regresar">
          ←
        </button>
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
