import styles from "./headquarters.module.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const inventoryData = [
  { nombre: "Acero Laminado", cantidad: 120, tamaño: "2m x 1m" },
  { nombre: "Cemento Portland", cantidad: 75, tamaño: "50kg c/u" },
  { nombre: "Madera Pino", cantidad: 40, tamaño: "2.5m x 20cm" },
];

const statisticsData = [
  { name: "Ene", ventas: 400 },
  { name: "Feb", ventas: 300 },
  { name: "Mar", ventas: 480 },
  { name: "Abr", ventas: 180 },
];

const moneyData = [
  { periodo: "Día", valor: 1200 },
  { periodo: "Semana", valor: 8400 },
  { periodo: "Mes", valor: 32000 },
];

const topSellingData = [
  { nombre: "Cemento Portland", ventas: 500 },
  { nombre: "Acero Laminado", ventas: 320 },
  { nombre: "Madera Pino", ventas: 180 },
];

export default function Headquarters() {
  return (
    <div className={styles.container}>
      
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
              <Tooltip contentStyle={{ backgroundColor: "#222", border: "none", color: "#fff" }} />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="#00eaff" strokeWidth={3} dot={{ r: 5, fill: "#ff00ff" }} />
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
                <span>{i + 1}. {item.nombre}</span>
                <strong>{item.ventas}</strong>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
