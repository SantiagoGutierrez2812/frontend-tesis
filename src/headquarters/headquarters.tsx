import { useState, useEffect } from "react";
import styles from "./headquarters.module.css";
import TopControl from "../TopControl/TopControl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Asegúrate de que esta ruta sea correcta para tu archivo de tipos
import type { InventoryDisplayItem } from "../services/types/types"; 
// Ajusta la ruta a tu servicio
import { fetchAndTransformInventories } from "../services/inventory/app_inventario"; 


// --- Data Definitions (Mocks) ---
const statisticsData = [
  { name: "Ene", ventas: 400, fecha: "2025-01-15" },
  { name: "Feb", ventas: 300, fecha: "2025-02-12" },
  { name: "Mar", ventas: 480, fecha: "2025-03-20" },
  { name: "Abr", ventas: 180, fecha: "2025-04-05" },
];

const moneyData = [
  { periodo: "Día", valor: 1200, fecha: "2025-09-20" },
  { periodo: "Semana", valor: 8400, fecha: "2025-09-25" },
  { periodo: "Mes", valor: 32000, fecha: "2025-09-30" },
];

const topSellingData = [
  { nombre: "Cemento Portland", ventas: 500 },
  { nombre: "Acero Laminado", ventas: 320 },
  { nombre: "Madera Pino", ventas: 180 },
];

const employeesData = [
  { nombre: "Juan Pérez", productividad: 85 },
  { nombre: "María López", productividad: 72 },
  { nombre: "Carlos Ruiz", productividad: 93 },
  { nombre: "Ana Gómez", productividad: 60 },
  { nombre: "Pedro Sánchez", productividad: 78 },
];

const deletedMaterialsData = [
  { nombre: "Arena Fina", eliminadoPor: "Juan Pérez", fecha: "2025-09-20" },
  { nombre: "Ladrillos", eliminadoPor: "Ana Gómez", fecha: "2025-09-19" },
];

const stockLevelData = [
  { nombre: "Acero Laminado", nivel: 75 },
  { nombre: "Cemento Portland", nivel: 50 },
  { nombre: "Madera Pino", nivel: 30 },
  { nombre: "Arena Fina", nivel: 10 },
];

const monthlyDetails = {
  Ene: [
    { nombre: "Cemento Portland", cantidad: 120 },
    { nombre: "Acero Laminado", cantidad: 80 },
  ],
  Feb: [
    { nombre: "Madera Pino", cantidad: 50 },
    { nombre: "Cemento Portland", cantidad: 100 },
  ],
  Mar: [
    { nombre: "Acero Laminado", cantidad: 200 },
    { nombre: "Madera Pino", cantidad: 120 },
  ],
  Abr: [
    { nombre: "Cemento Portland", cantidad: 70 },
    { nombre: "Acero Laminado", cantidad: 50 },
  ],
};

// --- Filtros disponibles ---
const filters = [
  { value: "inventory", label: "📦 Inventario" },
  { value: "stats", label: "📊 Estadísticas" },
  { value: "money", label: "💰 Inversión" },
  { value: "top", label: "🔥 Top Materiales" },
  { value: "employees", label: "👨‍💼 Empleados" },
  { value: "deleted", label: "🗑️ Eliminados" },
  { value: "stock", label: "📉 Nivel de Stock" },
];

export default function Headquarters() {
  // Estados para la carga de datos del Inventario
  const [inventoryData, setInventoryData] = useState<InventoryDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilters, setActiveFilters] = useState<string[]>(["all"]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);

  // Lógica de carga de datos del inventario
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await fetchAndTransformInventories(); 
        
        setInventoryData(data);
        setError(null);
      } catch (e) {
        if (e instanceof Error) {
          setError(`Error de carga: ${e.message}. Asegúrate que el servidor esté activo.`);
        } else {
          setError("Ocurrió un error desconocido al cargar el inventario.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);


  // Funciones de filtrado
  const filterBySearch = <T extends { nombre?: string }>(data: T[]) => {
    if (!search) return data;
    return data.filter((item) =>
      item.nombre?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filterByDate = <T extends { fecha?: string }>(data: T[]) => {
    if (!startDate && !endDate) return data;
    return data.filter((item) => {
      if (!item.fecha) return true;
      const itemDate = new Date(item.fecha).getTime();
      const start = startDate ? new Date(startDate).getTime() : -Infinity;
      const end = endDate ? new Date(endDate).getTime() : Infinity;
      return itemDate >= start && itemDate <= end;
    });
  };

  const openModal = (item: any) => {
    setModalContent(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  const handleChartClick = (data: any) => {
    if (!data || !data.payload) return;
    const month = data.payload.name as keyof typeof monthlyDetails;
    setModalContent({
      nombre: `Ventas de ${month}`,
      detalle: monthlyDetails[month] || [],
    });
    setModalOpen(true);
  };

  const toggleFilter = (value: string) => {
    if (value === "all") {
      setActiveFilters(activeFilters.includes("all") ? [] : ["all"]);
      return;
    }
    const currentFilters = activeFilters.filter((f) => f !== "all");
    if (currentFilters.includes(value)) {
      const newFilters = currentFilters.filter((f) => f !== value);
      setActiveFilters(newFilters.length === 0 ? ["all"] : newFilters);
    } else {
      setActiveFilters([...currentFilters, value]);
    }
  };

  const filterIsActive = (value: string) =>
    activeFilters.includes("all") || activeFilters.includes(value);

  return (
    <div className={styles.container}>
      <TopControl title="🚀 Panel de Inventario" />

      <div className={styles.filterBar}>
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={`${styles.filterButton} ${activeFilters.includes(filter.value) ? styles.activeFilter : ""
              }`}
            onClick={() => toggleFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}

        <input
          type="text"
          placeholder="🔍 Buscar por nombre..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          className={styles.dateInput}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className={styles.dateInput}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className={styles.secondary_container}>
        {/* 📦 Inventario - Solución de Doble Tabla para Scroll y Fixed Header */}
        {filterIsActive("inventory") && (
          <div className={`${styles.block} ${styles.inventoryTableContainer}`}>
            <h2 className={styles.sectionTitle}>📋 Resumen Inventario</h2>

            {loading && <p className={styles.loadingMessage}>Cargando inventario...</p>}
            {error && <p className={styles.errorMessage}>{error}</p>}

            {!loading && !error && (
              <>
                {/* 1. CABECERA FIJA (Tabla separada) */}
                <table className={`${styles.table} ${styles.tableHeader}`}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Cantidad</th>
                      <th>Tamaño</th>
                    </tr>
                  </thead>
                </table>

                {/* 2. CUERPO SCROLLABLE (Contenedor con scroll) */}
                <div className={styles.tableBodyScroll}>
                  {/* 3. CUERPO DE LA TABLA (Tabla interior) */}
                  <table className={styles.table}>
                    <tbody>
                        {/* Importante: Mapeo sin espacios entre <tr> y <td> */}
                      {filterBySearch(inventoryData).map((item, i) => (
                        <tr key={i}>
                          <td>{item.nombre}</td>
                          <td>{item.cantidad}</td>
                          <td>{item.tamaño}</td> 
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* 🔥 Top Materiales */}
        {filterIsActive("top") && (
          <div className={styles.block}>
            <h2 className={styles.sectionTitle}>🔥 Materiales Más Vendidos</h2>
            <ul className={styles.topList}>
              {filterBySearch(topSellingData).map((item, i) => (
                <li
                  key={i}
                  onClick={() => openModal(item)}
                  style={{ cursor: "pointer" }}
                >
                  <span>
                    {i + 1}. {item.nombre}
                  </span>
                  <strong>{item.ventas}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 📊 Estadísticas */}
        {filterIsActive("stats") && (
          <div className={`${styles.block} ${styles.statsBlock}`}>
            <h2 className={styles.sectionTitle}>📊 Estadísticas</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={filterByDate(statisticsData)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#222",
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="#00eaff"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#ff00ff" }}
                  onClick={handleChartClick}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 💰 Dinero Invertido */}
        {filterIsActive("money") && (
          <div className={styles.block}>
            <h2 className={styles.sectionTitle}>💰 Dinero Invertido</h2>
            <div className={styles.moneyCards}>
              {filterByDate(moneyData).map((item, i) => (
                <div
                  key={i}
                  className={styles.moneyCard}
                  onClick={() => openModal(item)}
                  style={{ cursor: "pointer" }}
                >
                  <h3>{item.periodo}</h3>
                  <p>${item.valor.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 👨‍💼 Empleados */}
        {filterIsActive("employees") && (
          <div className={`${styles.block} ${styles.employeeBlock}`}>
            <h2 className={styles.sectionTitle}>👨‍💼 Empleados y Productividad</h2>
            <ul className={styles.employeeList}>
              {filterBySearch(employeesData).map((emp, i) => (
                <li key={i} className={styles.employeeItem}>
                  <span>{emp.nombre}</span>
                  <div className={styles.barContainer}>
                    <div
                      className={styles.bar}
                      style={{ width: `${emp.productividad}%` }}
                    ></div>
                  </div>
                  <span className={styles.percent}>{emp.productividad}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 🗑️ Eliminados */}
        {filterIsActive("deleted") && (
          <div className={`${styles.block} ${styles.deletedBlock}`}>
            <h2 className={styles.sectionTitle}>🗑️ Materiales Eliminados</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Eliminado por</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filterByDate(filterBySearch(deletedMaterialsData)).map(
                  (item, i) => (
                    <tr key={i}>
                      <td>{item.nombre}</td>
                      <td>{item.eliminadoPor}</td>
                      <td>{item.fecha}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 📉 Nivel de Stock */}
        {filterIsActive("stock") && (
          <div className={styles.block}>
            <h2 className={styles.sectionTitle}>📉 Nivel de Stock</h2>
            <ul className={styles.employeeList}>
              {filterBySearch(stockLevelData).map((item, i) => (
                <li key={i} className={styles.employeeItem}>
                  <span>{item.nombre}</span>
                  <div className={styles.barContainer}>
                    <div
                      className={styles.bar}
                      style={{
                        width: `${item.nivel}%`,
                        background: item.nivel < 20 ? "red" : "limegreen",
                      }}
                    ></div>
                  </div>
                  <span className={styles.percent}>{item.nivel}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.modalClose} onClick={closeModal}>
              &times;
            </button>
            <h2>{modalContent?.nombre}</h2>
            {modalContent?.detalle?.length > 0 ? (
              <ul>
                {modalContent.detalle.map((item: any, i: number) => (
                  <li key={i}>
                    {item.nombre}: {item.cantidad} unidades
                  </li>
                ))}
              </ul>
            ) : (
              <>
                {modalContent?.ventas && <p>Ventas: {modalContent.ventas}</p>}
                {modalContent?.valor && (
                  <p>Valor: ${modalContent.valor.toLocaleString()}</p>
                )}
                {modalContent?.fecha && <p>Fecha: {modalContent.fecha}</p>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}