import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./GestionProveedores.css";
import TopControl from "../TopControl/TopControl";
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from "../services/supplier/supplier_service";
import type { Proveedor } from "../services/types/supplier_interface";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ==================== MODAL DE CONFIRMACIÓN ====================
const ConfirmModal = ({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <h2>⚠️ Confirmar cambios</h2>
        <p>{message}</p>
        <div className="confirm-buttons">
          <button onClick={onCancel} className="btn-cancelar-confirm">
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn-aceptar-confirm">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
// ===============================================================

// ✅ Lista de ciudades de Colombia
const ciudadesColombia = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
  "Cúcuta",
  "Manizales",
  "Pereira",
  "Armenia",
  "Santa Marta",
  "Ibagué",
  "Neiva",
  "Villavicencio",
  "Sincelejo",
  "Montería",
  "Popayán",
  "Tunja",
  "Valledupar",
  "Pasto",
];

function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function sanitizeSupplier(supplier: Proveedor) {
  const allowed = [
    "name",
    "nit",
    "email",
    "contact_name",
    "phone_number",
    "address",
    "city",
    "description",
    "is_active",
  ];
  const cleaned: any = {};
  for (const key of allowed) {
    if (key in supplier) cleaned[key] = supplier[key as keyof Proveedor];
  }
  return cleaned;
}

export default function GestionProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [filtro, setFiltro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});
  const [editando, setEditando] = useState<Proveedor | null>(null);
  const [nuevoProveedor, setNuevoProveedor] = useState<Proveedor>({
    id: 0,
    name: "",
    nit: "",
    email: "",
    contact_name: "",
    phone_number: "",
    address: "",
    description: "",
    city: "",
  });

  const letterRemoveRegex: RegExp = (() => {
    try {
      return new RegExp("[^\\p{L}\\s'-]+", "gu");
    } catch {
      return new RegExp("[^A-Za-zÁÉÍÓÚáéíóúÑñ\\s'-]+", "g");
    }
  })();

  const contactValidateRegex: RegExp = (() => {
    try {
      return new RegExp("^[\\p{L}\\s'-]+$", "u");
    } catch {
      return new RegExp("^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s'-]+$");
    }
  })();

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const data = await getSuppliers();
        setProveedores(data);
      } catch {
        toast.error("Error al cargar proveedores");
      }
    }
    fetchSuppliers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "contact_name") {
      const cleaned = value.replace(letterRemoveRegex, "");
      setNuevoProveedor({ ...nuevoProveedor, contact_name: cleaned });
      return;
    }

    if (name === "phone_number" || name === "nit") {
      const digits = value.replace(/[^\d]/g, "");
      setNuevoProveedor({ ...nuevoProveedor, [name]: digits });
      return;
    }

    setNuevoProveedor({ ...nuevoProveedor, [name]: value });
  };

  const abrirModalNuevo = () => {
    setEditando(null);
    setNuevoProveedor({
      id: 0,
      name: "",
      nit: "",
      email: "",
      contact_name: "",
      phone_number: "",
      address: "",
      description: "",
      city: "",
    });
    setShowModal(true);
  };

  const abrirModalEditar = (prov: Proveedor) => {
    setEditando(prov);
    setNuevoProveedor(prov);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nuevoProveedor.name.trim().length < 3)
      return toast.warn("El nombre debe tener al menos 3 caracteres");

    if (!/^\d{9}$/.test(String(nuevoProveedor.nit)))
      return toast.warn("El NIT debe tener exactamente 9 dígitos");
    if (!nuevoProveedor.email.includes("@"))
      return toast.warn("El correo debe contener un @ válido");
    if (!nuevoProveedor.contact_name || !contactValidateRegex.test(nuevoProveedor.contact_name))
      return toast.warn("El nombre de contacto solo debe contener letras válidas");
    if (!/^\d+$/.test(String(nuevoProveedor.phone_number)))
      return toast.warn("El teléfono solo debe contener números");
    if (!nuevoProveedor.description || nuevoProveedor.description.length < 9)
      return toast.warn("La descripción debe tener al menos 9 caracteres");

    if (!ciudadesColombia.includes(nuevoProveedor.city ?? ""))
      return toast.warn("Debe seleccionar una ciudad válida de Colombia");

    const nitDuplicado = proveedores.some(
      (p) => p.nit === nuevoProveedor.nit && (!editando || p.id !== editando.id)
    );
    if (nitDuplicado) return toast.error("El NIT ya está registrado");

    const correoDuplicado = proveedores.some(
      (p) =>
        p.email.toLowerCase() === nuevoProveedor.email.toLowerCase() &&
        (!editando || p.id !== editando.id)
    );
    if (correoDuplicado) return toast.error("El correo ya está registrado");

    // Confirmación personalizada
    setOnConfirmAction(() => async () => {
      try {
        if (editando) {
          const updated = await updateSupplier(editando.id, sanitizeSupplier(nuevoProveedor));
          setProveedores(proveedores.map((p) => (p.id === editando.id ? updated : p)));
          toast.success("Proveedor actualizado con éxito");
        } else {
          const created = await createSupplier(nuevoProveedor);
          setProveedores([...proveedores, created.supplier ?? created]);
          toast.success("Proveedor creado correctamente");
        }
        setShowModal(false);
        setEditando(null);
      } catch {
        toast.error("Hubo un error al guardar");
      } finally {
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const eliminarProveedor = (id: number) => {
    setOnConfirmAction(() => async () => {
      try {
        await deleteSupplier(id);
        setProveedores(proveedores.filter((p) => p.id !== id));
        toast.info("Proveedor eliminado correctamente");
      } catch {
        toast.error("Error al eliminar proveedor");
      } finally {
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const proveedoresFiltrados = proveedores.filter((p) =>
    p.name?.toLowerCase().includes(filtro.toLowerCase())
  );

  const data = [...new Set(proveedores.map((p) => normalizeCity(p.city ?? "")))].map((city) => ({
    name: city,
    value: proveedores.filter(
      (p) => normalizeCity(p.city ?? "") === city
    ).length,
  }));

  const COLORS = ["#0070ff", "#00c49f", "#ffb400", "#e74c3c", "#9b59b6"];

  return (
    <div className="proveedores-container">
      <TopControl title="🚀 Panel de Gestión de Proveedores" />

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="proveedores-card">
        <div className="proveedores-header">
          <h1>Gestión de Proveedores</h1>
          <button className="btn-insertar" onClick={abrirModalNuevo}>
            ➕ Insertar Nuevo Proveedor
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>📦 Total Proveedores</h3>
            <p>{proveedores.length}</p>
          </div>
          <div className="stat-card">
            <h3>🏙️ Ciudades</h3>
            <p>{data.length}</p>
          </div>
          <div className="stat-card">
            <h3>Distribución por ciudad</h3>
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" outerRadius={30} dataKey="value">
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <input
          type="text"
          placeholder="🔎 Buscar proveedor..."
          className="buscador"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />

        <div className="tabla-container">
          <table className="tabla-proveedores">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>NIT</th>
                <th>Email</th>
                <th>Nombre de contacto</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Descripción</th>
                <th>Ciudad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedoresFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.nit}</td>
                  <td>{p.email}</td>
                  <td>{p.contact_name}</td>
                  <td>{p.phone_number}</td>
                  <td>{p.address}</td>
                  <td>{p.description}</td>
                  <td>{p.city}</td>
                  <td className="acciones">
                    <button className="btn-editar" onClick={() => abrirModalEditar(p)}>✏️</button>
                    <button className="btn-eliminar" onClick={() => eliminarProveedor(p.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PRINCIPAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editando ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
            <form onSubmit={handleSubmit}>
              <label>Nombre</label>
              <input name="name" value={nuevoProveedor.name} onChange={handleChange} required />

              <label>NIT</label>
              <input name="nit" value={nuevoProveedor.nit} onChange={handleChange} required />

              <label>Email</label>
              <input name="email" type="email" value={nuevoProveedor.email} onChange={handleChange} required />

              <label>Nombre de contacto</label>
              <input name="contact_name" value={nuevoProveedor.contact_name} onChange={handleChange} required />

              <label>Teléfono</label>
              <input name="phone_number" value={nuevoProveedor.phone_number} onChange={handleChange} required />

              <label>Dirección</label>
              <input name="address" value={nuevoProveedor.address} onChange={handleChange} required />

              <label>Ciudad</label>
              <select
                name="city"
                value={nuevoProveedor.city}
                onChange={handleChange}
                className="select-ciudad"
                required
              >
                <option value="">Selecciona una ciudad</option>
                {ciudadesColombia.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <label>Descripción</label>
              <textarea name="description" value={nuevoProveedor.description} onChange={handleChange} required />

              <div className="modal-buttons">
                <button type="submit" className="btn-guardar">
                  {editando ? "Actualizar" : "Guardar"}
                </button>
                <button type="button" className="btn-cancelar" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirm && (
        <ConfirmModal
          message={
            editando
              ? `¿Estás seguro de modificar los datos de ${nuevoProveedor.name}?`
              : `¿Estás seguro de registrar a ${nuevoProveedor.name}?`
          }
          onConfirm={onConfirmAction}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
