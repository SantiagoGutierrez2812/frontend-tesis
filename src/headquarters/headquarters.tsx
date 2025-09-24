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

// 📦 Inventario
const inventoryData = [
  { nombre: "Acero Laminado", cantidad: 120, tamaño: "2m x 1m" },
  { nombre: "Cemento Portland", cantidad: 75, tamaño: "50kg c/u" },
  { nombre: "Madera Pino", cantidad: 40, tamaño: "2.5m x 20cm" },
];

// 📊 Estadísticas de ventas
const statisticsData = [
  { name: "Ene", ventas: 400 },
  { name: "Feb", ventas: 300 },
  { name: "Mar", ventas: 480 },
  { name: "Abr", ventas: 180 },
];

// 💰 Dinero invertido
const moneyData = [
  { periodo: "Día", valor: 1200 },
  { periodo: "Semana", valor: 8400 },
  { periodo: "Mes", valor: 32000 },
];

// 🔥 Materiales más vendidos
const topSellingData = [
  { nombre: "Cemento Portland", ventas: 500 },
  { nombre: "Acero Laminado", ventas: 320 },
  { nombre: "Madera Pino", ventas: 180 },
];

// 👨‍💼 Empleados
const employeesData = [
  { nombre: "Juan Pérez", productividad: 85 },
  { nombre: "María López", productividad: 72 },
  { nombre: "Carlos Ruiz", productividad: 93 },
  { nombre: "Ana Gómez", productividad: 60 },
  { nombre: "Pedro Sánchez", productividad: 78 },
];

// 🗑️ Materiales eliminados
const deletedMaterialsData = [
  { nombre: "Arena Fina", eliminadoPor: "Juan Pérez", fecha: "20/09/2025" },
  { nombre: "Ladrillos", eliminadoPor: "Ana Gómez", fecha: "19/09/2025" },
];

export default function Headquarters() {
  return (
    
    <div className={styles.container}>
       <TopControl title="🚀 Panel de Administración" />

       buton = conf
      {/* HEADER PRINCIPAL */}
      <header className={styles.header}>
        <h1 className={styles.titleInventory}>📦 Inventario</h1>
      </header>

      {/* GRID DE BLOQUES */}
      <div className={styles.secondary_container}>
        {/* INVENTARIO */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>📋 Resumen Inventario</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Tamaño</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((item, i) => (
                <tr key={i}>
                  <td>{item.nombre}</td>
                  <td>{item.cantidad}</td>
                  <td>{item.tamaño}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ESTADÍSTICAS */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>📊 Estadísticas</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={statisticsData}>
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
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* DINERO INVERTIDO */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>💰 Dinero Invertido</h2>
          <div className={styles.moneyCards}>
            {moneyData.map((item, i) => (
              <div key={i} className={styles.moneyCard}>
                <h3>{item.periodo}</h3>
                <p>${item.valor.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TOP MATERIALES */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>🔥 Materiales Más Vendidos</h2>
          <ul className={styles.topList}>
            {topSellingData.map((item, i) => (
              <li key={i}>
                <span>
                  {i + 1}. {item.nombre}
                </span>
                <strong>{item.ventas}</strong>
              </li>
            ))}
          </ul>
        </div>

        {/* EMPLEADOS */}
        <div className={`${styles.block} ${styles.employeeBlock}`}>
          <h2 className={styles.sectionTitle}>👨‍💼 Empleados y Productividad</h2>
          <ul className={styles.employeeList}>
            {employeesData.map((emp, i) => (
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

        {/* MATERIALES ELIMINADOS */}
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
              {deletedMaterialsData.map((item, i) => (
                <tr key={i}>
                  <td>{item.nombre}</td>
                  <td>{item.eliminadoPor}</td>
                  <td>{item.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
