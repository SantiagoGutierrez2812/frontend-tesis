import React, { useState } from "react";
import TopControl from "../TopControl/TopControl";
import "./Materialcreation.css";

export default function Materialcreation() {
  const [showModal, setShowModal] = useState(false);
  const [materials, setMaterials] = useState([
    { id: 1, nombre: "Acero Inoxidable", tamaño: "2m x 1m" },
    { id: 2, nombre: "Plástico ABS", tamaño: "1.5m x 0.8m" },
  ]);

  const [newMaterial, setNewMaterial] = useState({
    nombre: "",
    tamaño: "",
  });

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("modal")) setShowModal(false);
  };

  const handleSave = () => {
    if (!newMaterial.nombre || !newMaterial.tamaño) return;
    setMaterials([
      ...materials,
      { id: materials.length + 1, ...newMaterial },
    ]);
    setNewMaterial({ nombre: "", tamaño: "" });
    setShowModal(false);
  };

  return (
    <div> <TopControl title="🚀 Panel de Gestión de Proveedores" />
    <div className="dashboard-container">


      <div className="header-section">
        <h2 className="page-title">📦 Registro de Inventario</h2>
      </div>

      {/* Barra de búsqueda y botón */}
      <div className="control-bar">
        <input
          type="text"
          placeholder="🔍 Buscar material..."
          className="search-input"
        />
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Crear producto
        </button>
      </div>

      {/* Tabla */}
      <div className="glass-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Material</th>
              <th>Tamaño</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((mat) => (
              <tr key={mat.id}>
                <td>{mat.id}</td>
                <td>{mat.nombre}</td>
                <td>{mat.tamaño}</td>
                <td className="actions">
                  <button className="edit">✏️</button>
                  <button className="delete">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal_1" onClick={handleModalClick}>
          <div className="modal-content_1">
            <h3>✨ Crear Producto</h3>
            <label>Nombre del Material</label>
            <input
              type="text"
              value={newMaterial.nombre}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, nombre: e.target.value })
              }
              placeholder="Ej: Acero galvanizado"
            />
            <label>Tamaño del Material</label>
            <input
              type="text"
              value={newMaterial.tamaño}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, tamaño: e.target.value })
              }
              placeholder="Ej: 2m x 1m"
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn-save" onClick={handleSave}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
