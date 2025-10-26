import React, { useEffect, useState } from "react";
import type { inventory_material_record } from "../../services/types/inventory/inventory";
import { get_read_from } from "../../services/inventory/materials_creation_section";
import { useNavigate } from "react-router-dom";
import "./styled-components.css";

export default function InventoryPyramids() {
  const [materials, setMaterials] = useState<inventory_material_record[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await get_read_from();
        setMaterials(data.slice(0, 6));
      } catch (err: any) {
        console.error("Error al obtener inventario:", err);
        setError("No se pudo obtener el inventario.");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (materials.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % materials.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [materials]);

  const current = materials[currentIndex];
  const navigate = useNavigate();

  return (
    <div className="inventory-container" onClick={() => navigate("/registro")}>
      <p className="text1"><b>REGISTRO DE MATERIAL</b></p>
      {error && <p className="error-text">{error}</p>}

      <div className="styled-wrapper">
        <div className="pyramid-loader">
          <div className="wrapper">
            <div className="side side1"><p>{current?.product_name ?? "..."}</p></div>
            <div className="side side2"><p>{current?.product_size ?? "..."}</p></div>
            <div className="side side3"><p>${current?.price ?? "..."}</p></div>
            <div className="side side4"><p>Cant: {current?.quantity ?? "..."}</p></div>
            <span className="shadow" />
          </div>
        </div>
      </div>
    </div>
  );
}
