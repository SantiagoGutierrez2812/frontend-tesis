import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./GestionProveedores.css";
import TopControl from "../TopControl/TopControl";

interface Proveedor {
  id: number;
  nombre: string;
  nit: string;
  email: string;
  contacto: string;
  telefono: string;
  direccion: string;
  descripcion: string;
  ciudad?: string;
}

export default function GestionProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([
    {
      id: 1,
      nombre: "Acero Fuerte S.A.",
      nit: "800.123.456-1",
      email: "contacto@acerofuerte.com",
      contacto: "Luis Gómez",
      telefono: "310-555-1234",
      direccion: "Calle 10 # 5-20, Bogotá",
      descripcion: "Especialistas en tornillería industrial.",
      ciudad: "Bogotá",
    },
    {
      id: 2,
      nombre: "Logística Global Ltda.",
      nit: "900.789.012-3",
      email: "ventas@logistg.net",
      contacto: "María Pérez",
      telefono: "601-234-5678",
      direccion: "Av. Industrial # 45-10, Medellín",
      descripcion: "Distribución de insumos industriales.",
      ciudad: "Medellín",
    },
  ]);

  const [filtro, setFiltro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Proveedor | null>(null);
  const [nuevoProveedor, setNuevoProveedor] = useState<Proveedor>({
    id: 0,
    nombre: "",
    nit: "",
    email: "",
    contacto: "",
    telefono: "",
    direccion: "",
    descripcion: "",
  });

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
      nombre: "",
      nit: "",
      email: "",
      contacto: "",
      telefono: "",
      direccion: "",
      descripcion: "",
    });
    setShowModal(true);
  };

  const abrirModalEditar = (prov: Proveedor) => {
    setEditando(prov);
    setNuevoProveedor(prov);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoProveedor.nombre || !nuevoProveedor.nit) return;

    if (editando) {
      setProveedores(
        proveedores.map((p) =>
          p.id === editando.id ? { ...nuevoProveedor, id: editando.id } : p
        )
      );
    } else {
      const nuevo = { ...nuevoProveedor, id: proveedores.length + 1 };
      setProveedores([...proveedores, nuevo]);
    }

    setShowModal(false);
    setEditando(null);
  };

  const eliminarProveedor = (id: number) => {
    if (window.confirm("¿Seguro que deseas eliminar este proveedor?")) {
      setProveedores(proveedores.filter((p) => p.id !== id));
    }
  };

  const proveedoresFiltrados = proveedores.filter((p) =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  // Datos para el gráfico
  const ciudades = [...new Set(proveedores.map((p) => p.ciudad))];
  const data = ciudades.map((c) => ({
    name: c,
    value: proveedores.filter((p) => p.ciudad === c).length,
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
            <h3>🧰 Industrias</h3>
            <p>3</p>
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

        {/* Gráfico */}
        <div className="chart-section">
          <h3>Distribución por ciudad</h3>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={70}
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

        {/* Tabla */}
        <div className="tabla-container">
          <table className="tabla-proveedores">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>NIT</th>
                <th>Email</th>
                <th>Contacto</th>
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
                  <td>{p.nombre}</td>
                  <td>{p.nit}</td>
                  <td>{p.email}</td>
                  <td>{p.contacto}</td>
                  <td>{p.telefono}</td>
                  <td>{p.direccion}</td>
                  <td>{p.descripcion}</td>
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
                name="nombre"
                value={nuevoProveedor.nombre}
                onChange={handleChange}
                required
              />

              <label>NIT</label>
              <input
                name="nit"
                value={nuevoProveedor.nit}
                onChange={handleChange}
                required
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={nuevoProveedor.email}
                onChange={handleChange}
              />

              <label>Contacto</label>
              <input
                name="contacto"
                value={nuevoProveedor.contacto}
                onChange={handleChange}
              />

              <label>Teléfono</label>
              <input
                name="telefono"
                value={nuevoProveedor.telefono}
                onChange={handleChange}
              />

              <label>Dirección</label>
              <input
                name="direccion"
                value={nuevoProveedor.direccion}
                onChange={handleChange}
              />

              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={nuevoProveedor.descripcion}
                onChange={handleChange}
              />

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
