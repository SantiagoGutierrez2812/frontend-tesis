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
import { createSupplier, deleteSupplier, getSuppliers, updateSupplier } from "../services/supplier/supplier_service";
import type { Proveedor } from "../services/types/supplier_interface";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    city: ""
  });

  useEffect(() => {

    async function fetchSuppliers() {
      try {
        const data = await getSuppliers();

        setProveedores(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }


    fetchSuppliers();
  }, []);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
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
      city: ""
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
    if (!nuevoProveedor.name || !nuevoProveedor.nit) return;

    try {
      if (editando) {

        const updated = await updateSupplier(editando.id, sanitizeSupplier(nuevoProveedor));

        setProveedores(
          proveedores.map((p) => (p.id === editando.id ? updated : p))
        );
      } else {
        const created = await createSupplier(nuevoProveedor);
        setProveedores([...proveedores, created.supplier]);
      }

      setShowModal(false);
      setEditando(null);
    }
    catch (error: any) {
      console.error("Error al crear proveedor:", error);
      alert("Hubo un error al crear el proveedor.");
    }
  }

  const eliminarProveedor = async (id: number) => {
    if (window.confirm("¿Seguro que deseas eliminar este proveedor?")) {
      try {
        await deleteSupplier(id);
        setProveedores(proveedores.filter((p) => p.id !== id));

      }
      catch (error: any) {
        console.error("Error al eliminar proveedor:", error);
        alert("Hubo un error al eliminar el proveedor.");
      }
    }
  };

  const proveedoresFiltrados = proveedores.filter((p) =>
    p.name?.toLowerCase().includes(filtro.toLowerCase())
  );

  // Datos para el gráfico
  const ciudades = [...new Set(proveedores.map((p) => p.city))];
  const data = ciudades.map((c) => ({
    name: c,
    value: proveedores.filter((p) => p.city === c).length,
  }));

  const COLORS = ["#0070ff", "#00c49f", "#ffb400", "#e74c3c"];

  return (
    <div className="proveedores-container">
      <TopControl title="🚀 Panel de Gestión de Proveedores" />

      <div className="proveedores-card">
        {/* Encabezado */}
        <div className="proveedores-header">
          <h1>Gestión de Proveedores</h1>
          <button className="btn-insertar" onClick={abrirModalNuevo}>
            ➕ Insertar Nuevo Proveedor
          </button>
        </div>

        {/* Tarjetas de métricas */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>📦 Total Proveedores</h3>
            <p>{proveedores.length}</p>
          </div>
          <div className="stat-card">
            <h3>🏙️ Ciudades</h3>
            <p>{ciudades.length}</p>
          </div>
          <div className="stat-card">
            <h3>Distribución por ciudad</h3>
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={30}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Buscador */}
        <input
          type="text"
          placeholder="🔎 Buscar proveedor..."
          className="buscador"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />

        {/* Tabla */}
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
                  <td className="acciones">
                    <button
                      className="btn-editar"
                      onClick={() => abrirModalEditar(p)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-eliminar"
                      onClick={() => eliminarProveedor(p.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editando ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
            <form onSubmit={handleSubmit}>
              <label>Nombre</label>
              <input
                name="name"
                value={nuevoProveedor.name}
                onChange={handleChange}
                required />

              <label>NIT</label>
              <input
                name="nit"
                value={nuevoProveedor.nit}
                onChange={handleChange}
                required />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={nuevoProveedor.email}
                onChange={handleChange}
                required />

              <label>Nombre de contacto</label>
              <input
                name="contact_name"
                value={nuevoProveedor.contact_name}
                onChange={handleChange}
                required />

              <label>Teléfono</label>
              <input
                name="phone_number"
                value={nuevoProveedor.phone_number}
                onChange={handleChange}
                required />

              <label>Dirección</label>
              <input
                name="address"
                value={nuevoProveedor.address}
                onChange={handleChange}
                required />

              <label>Ciudad</label>
              <input
                name="city"
                value={nuevoProveedor.city}
                onChange={handleChange}
                required />

              <label>Descripción</label>
              <textarea
                name="description"
                value={nuevoProveedor.description}
                onChange={handleChange}
                required />

              <div className="modal-buttons">
                <button type="submit" className="btn-guardar">
                  {editando ? "Actualizar" : "Guardar"}
                </button>
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
