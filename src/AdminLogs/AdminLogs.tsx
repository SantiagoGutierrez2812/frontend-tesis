import React, { useState, useEffect } from "react";
import TopControl from "../TopControl/TopControl";
import "./AdminLogs.css";

type LogType = "INFO" | "WARNING" | "ERROR";

interface Log {
  id: number;
  fecha: string;
  usuario: string;
  accion: string;
  tipo: LogType;
}

const mockLogs: Log[] = [
  { id: 1, fecha: "2025-09-17 10:34", usuario: "admin", accion: "Inicio de sesión", tipo: "INFO" },
  { id: 2, fecha: "2025-09-17 11:12", usuario: "jose", accion: "Eliminó producto", tipo: "WARNING" },
  { id: 3, fecha: "2025-09-17 12:05", usuario: "system", accion: "Error al conectar DB", tipo: "ERROR" },
  { id: 4, fecha: "2025-09-16 09:00", usuario: "user123", accion: "Actualizó perfil", tipo: "INFO" },
  { id: 5, fecha: "2025-09-15 15:30", usuario: "system", accion: "Advertencia de disco", tipo: "WARNING" },
];

export default function AdminLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("Todos");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    setLogs(mockLogs);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.fecha.split(" ")[0]);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const matchesSearch = log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.accion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "Todos" || log.tipo === filterType;

    const matchesDate = (!start || logDate >= start) && (!end || logDate <= end);

    return matchesSearch && matchesType && matchesDate;
  });

  const getBadgeColor = (type: LogType): string => {
    switch (type) {
      case "INFO":
        return "info";
      case "WARNING":
        return "warning";
      case "ERROR":
        return "error";
      default:
        return "";
    }
  };

  return (
    <div className="admin-logs">
      <TopControl title="🚀 Panel de Administración" />

      <div className="filters">
        <input 
          type="text" 
          placeholder="🔍 Buscar logs..." 
          className="search" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="select" 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="Todos">Todos</option>
          <option value="INFO">Info</option>
          <option value="WARNING">Warning</option>
          <option value="ERROR">Error</option>
        </select>
        <input 
          type="date" 
          className="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
        />
        <input 
          type="date" 
          className="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)} 
        />
      </div>

      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>📅 Fecha</th>
              <th>👤 Usuario</th>
              <th>⚡ Acción</th>
              <th>📌 Tipo</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.fecha}</td>
                  <td>{log.usuario}</td>
                  <td>{log.accion}</td>
                  <td>
                    <span className={`badge ${getBadgeColor(log.tipo)}`}>
                      {log.tipo === "INFO" && "ℹ️"}
                      {log.tipo === "WARNING" && "⚠️"}
                      {log.tipo === "ERROR" && "❌"}
                      {log.tipo}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                  No se encontraron logs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="summary">
        <div className="card info">
          ℹ️ Info: {filteredLogs.filter((l) => l.tipo === "INFO").length}
        </div>
        <div className="card warning">
          ⚠️ Warnings: {filteredLogs.filter((l) => l.tipo === "WARNING").length}
        </div>
        <div className="card error">
          ❌ Errores: {filteredLogs.filter((l) => l.tipo === "ERROR").length}
        </div>
      </div>
    </div>
  );
}
