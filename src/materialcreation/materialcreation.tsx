import React, { useState, useEffect } from "react";
import TopControl from "../TopControl/TopControl";
import "./Materialcreation.css";
import type { product_id_record } from "../services/types/product/product";
import {
  get_all_products,
  post_create_product,
  delete_product,
  patch_product,
} from "../services/product/materials_creation_section";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProfileModal from "../components/ProfileModal"; // ✅ Import del modal de perfil

interface Material {
  id: number;
  nombre: string;
  tamaño: string;
  precio: number;
  descripcion: string;
}

interface NewMaterialState {
  nombre: string;
  tamaño: string;
  precio: string;
  descripcion: string;
}

export default function Materialcreation() {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); // ✅ Modal de perfil
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nextId, setNextId] = useState(1);

  const [newMaterial, setNewMaterial] = useState<NewMaterialState>({
    nombre: "",
    tamaño: "",
    precio: "",
    descripcion: "",
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "delete") => {
    const icon =
      type === "success"
        ? "✅"
        : type === "error"
        ? "❌"
        : type === "info"
        ? "ℹ️"
        : "🗑️";
    toast(message, { icon: <span>{icon}</span>, className: `toast-${type}`, autoClose: 3000 });
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const products = await get_all_products();
        const mappedMaterials: Material[] = products.map((p) => ({
          id: (p as any).id ?? nextId,
          nombre: p.name,
          tamaño: p.size,
          precio: Number(p.price),
          descripcion: p.description,
        }));

        setMaterials(mappedMaterials);
        const maxId = mappedMaterials.reduce((max, m) => Math.max(max, m.id), 0);
        setNextId(maxId + 1);
        setError(null);
      } catch {
        setError("Error al cargar los materiales.");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains("modal_1")) setShowModal(false);
  };

  const handleSave = () => {
    const { nombre, tamaño, precio, descripcion } = newMaterial;
    if (!nombre || !tamaño || !descripcion || !precio) {
      showToast("Todos los campos son obligatorios.", "error");
      return;
    }
    setShowConfirmationModal(true);
  };

  const confirmSave = async () => {
    setShowConfirmationModal(false);
    const { nombre, tamaño, precio, descripcion } = newMaterial;
    const numericPrecio = Number(precio);
    if (isNaN(numericPrecio) || numericPrecio <= 0) {
      showToast("El Precio debe ser un número positivo válido.", "error");
      return;
    }

    const productData: product_id_record = {
      name: nombre.trim(),
      size: tamaño.trim(),
      price: numericPrecio,
      description: descripcion.trim(),
      is_active: true,
    };

    try {
      if (editingId) {
        await patch_product(editingId, productData);
        setMaterials((prev) =>
          prev.map((mat) =>
            mat.id === editingId
              ? { id: editingId, nombre, tamaño, precio: numericPrecio, descripcion }
              : mat
          )
        );
        showToast("Material actualizado ✅", "success");
      } else {
        const createdProduct = await post_create_product(productData);
        const productId = (createdProduct as any)?.product?.id;
        if (!productId) throw new Error("No se recibió ID del servidor");
        setMaterials((prev) => [
          ...prev,
          { id: productId, nombre, tamaño, precio: numericPrecio, descripcion },
        ]);
        showToast("Material guardado correctamente ✅", "success");
      }

      setEditingId(null);
      setNewMaterial({ nombre: "", tamaño: "", precio: "", descripcion: "" });
      setShowModal(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido al guardar el material ❌";
      showToast(errorMessage, "error");
    }
  };

  const handleEdit = (material: Material) => {
    setNewMaterial({
      nombre: material.nombre,
      tamaño: material.tamaño,
      precio: String(material.precio),
      descripcion: material.descripcion,
    });
    setEditingId(material.id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este material?")) return;
    try {
      await delete_product(id);
      setMaterials((prev) => prev.filter((mat) => mat.id !== id));
      showToast("Material eliminado correctamente 🗑️", "delete");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido al eliminar el material ❌";
      showToast(errorMessage, "error");
    }
  };

  const ConfirmationModal = () => (
    <div className="modal_1" onClick={() => setShowConfirmationModal(false)}>
      <div className="modal-content_1">
        <h4>Confirmar guardado</h4>
        <p>
          ¿Guardar el material <strong>{newMaterial.nombre}</strong>?
        </p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={() => setShowConfirmationModal(false)}>
            Cancelar
          </button>
          <button className="btn-save" onClick={confirmSave}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div>Cargando materiales... ⏳</div>;
  if (error) return <div>Error: {error} ❌</div>;

  // ✅ Agregamos una opción extra al menú del TopControl
  const menuOptions = [
    {
      label: "👤 Mi Perfil",
      onClick: () => setShowProfileModal(true),
    },
  ];

  return (
    <div className="dashboard-container">
      <TopControl title="📦 Panel de Gestión de Materiales" options={menuOptions} />
      <ToastContainer />

      <div className="control-bar">
        <input type="text" placeholder="🔍 Buscar material..." className="search-input" />
        <button
          className="btn-primary"
          onClick={() => {
            setShowModal(true);
            setEditingId(null);
          }}
        >
          + Crear Material
        </button>
      </div>

      <div
        className="glass-table"
        style={{
          maxHeight: materials.length > 5 ? "400px" : "auto",
          overflowY: materials.length > 5 ? "scroll" : "visible",
        }}
      >
        <table>
          <thead className="tabla-encabezado">
            <tr>
              <th className="th-id">ID</th>
              <th className="th-material">Material</th>
              <th className="th-tamano">Tamaño</th>
              <th className="th-descripcion">Descripción</th>
              <th className="th-precio">Precio ($)</th>
              <th className="th-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materials.length ? (
              materials.map((mat) => (
                <tr key={mat.id}>
                  <td>{mat.id}</td>
                  <td>{mat.nombre}</td>
                  <td>{mat.tamaño}</td>
                  <td>{mat.descripcion}</td>
                  <td>
                    {mat.precio.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="actions">
                    <button className="edit" onClick={() => handleEdit(mat)}>
                      ✏️
                    </button>
                    <button className="delete" onClick={() => handleDelete(mat.id)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No hay materiales registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal_1" onClick={handleModalClick}>
          <div className="modal-content_1">
            <h3>{editingId ? "✏️ Editar Material" : "Crear Material"}</h3>

            <label>Nombre del Material</label>
            <input
              placeholder="Nombre"
              value={newMaterial.nombre}
              onChange={(e) => setNewMaterial({ ...newMaterial, nombre: e.target.value })}
            />

            <label>Tamaño del Material</label>
            <input
              placeholder="Tamaño"
              value={newMaterial.tamaño}
              onChange={(e) => setNewMaterial({ ...newMaterial, tamaño: e.target.value })}
            />

            <label>Descripción</label>
            <input
              placeholder="Descripción"
              value={newMaterial.descripcion}
              onChange={(e) => setNewMaterial({ ...newMaterial, descripcion: e.target.value })}
            />

            <label>Precio Unitario ($)</label>
            <input
              type="number"
              placeholder="Precio"
              value={newMaterial.precio}
              onChange={(e) => setNewMaterial({ ...newMaterial, precio: e.target.value })}
            />

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn-save" onClick={handleSave}>
                {editingId ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmationModal && <ConfirmationModal />}

      {/* ✅ Modal de Perfil */}
      <ProfileModal show={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}
