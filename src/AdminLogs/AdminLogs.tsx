import React, { useState, useEffect, useMemo } from "react";
import TopControl from "../TopControl/TopControl"; 
import { get_all_logs } from "../services/log/log"; 
import { getUserLogins, getAppUsers } from "../services/user_logins/UserLogins"; 
import type { Log, LogRecord, LogType } from "../services/types/log/log"; 
import type { UserLogin, AppUser } from "../services/types/user_logins/UserLogin"; 
import "./AdminLogs.css"; 

// Tipo combinado para logins con info de usuario
type UserLoginWithUser = {
  id: number;
  app_user_id: number;
  created_at: string;
  username: string;
  email?: string;
  role?: string;
};

// Mapea los logs del backend a un formato uniforme
function mapLogRecord(record: Partial<LogRecord>): Log {
  const message = record.message || "Sin mensaje";
  const modulePath = record.module || "sistema";
  const moduleParts = modulePath.split(".");
  const moduleName = moduleParts.length > 0 ? moduleParts[moduleParts.length - 1] : "sistema"; 
  const createdAt = record.created_at || new Date().toISOString();

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const fecha = new Date(createdAt).toLocaleString(undefined, dateOptions);

  return {
    id: record.id || Math.floor(Math.random() * 100000),
    fecha,
    usuario: moduleName,
    accion: message,
    tipo: "ERROR", // Todos los logs se marcan como ERROR
  };
}

export default function AdminLogs() {
  const [rawLogs, setRawLogs] = useState<Log[]>([]);
  const [userLogins, setUserLogins] = useState<UserLoginWithUser[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("Todos");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalLogs, setModalLogs] = useState<Log[]>([]);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [isSummaryView, setIsSummaryView] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"logs" | "userLogins">("logs");

  // Cargar logs de sistema
  useEffect(() => {
    async function fetchLogs() {
      try {
        const records: LogRecord[] = await get_all_logs();
        const mappedLogs = records.map(mapLogRecord);
        setRawLogs(mappedLogs);
      } catch (error) {
        console.error("Error al obtener logs en el componente:", error);
      }
    }
    fetchLogs();
  }, []);

  // *** LÓGICA DE CARGA DE USER LOGINS CORREGIDA/SIMPLIFICADA ***
  // Ahora se carga directamente usando getUserLogins() y se asume que los datos
  // de usuario (username, email) vienen incluidos o se usa getAppUsers() como fallback.
  useEffect(() => {
    async function fetchUserLogins() {
      try {
        // Opción 1: Hacemos las dos llamadas (si getAppUsers devuelve datos de usuario puros)
        const [logins, users] = await Promise.all([getUserLogins(), getAppUsers()]);
        
        // Opción 2: Solo llamar a getUserLogins() si devuelve todo (más simple y eficiente):
        // const logins = await getUserLogins();
        // const users: AppUser[] = []; // O usa solo los datos que vienen en 'logins'

        const loginsWithUser: UserLoginWithUser[] = logins.map((login: UserLogin) => {
          // Buscamos el usuario correspondiente
          const user = users.find(u => u.id === login.app_user_id);
          
          // NOTA: DEBES ASEGURARTE DE QUE LOS DATOS DE USUARIO SEAN RECUPERABLES 
          // (YA SEA DEL OBJETO 'login' O DEL OBJETO 'user' OBTENIDO DE 'getAppUsers')

          return {
            id: login.id,
            app_user_id: login.app_user_id,
            created_at: login.created_at,
            // Usamos los datos de 'users' para rellenar la info
            username: user?.username || "N/A", 
            email: user?.email,
            role: user?.role !== undefined ? String(user.role) : undefined, 
          };
        });
        setUserLogins(loginsWithUser);
      } catch (err) {
        // Este error ya no debería ser 404 gracias a la corrección en services/UserLogins.ts
        console.error("Error al cargar logins de usuarios:", err);
      }
    }
    fetchUserLogins();
  }, []);

  // Filtrado de logs (sin cambios)
  const filteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      const logDate = new Date(log.fecha);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const matchesSearch =
        log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.accion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === "Todos" || log.tipo === filterType;

      const matchesDate =
        (!start || logDate >= new Date(start.setHours(0, 0, 0, 0))) &&
        (!end || logDate <= new Date(end.setHours(23, 59, 59, 999)));

      return matchesSearch && matchesType && matchesDate;
    });
  }, [rawLogs, searchTerm, filterType, startDate, endDate]);

  // Contadores
  const errorCount = filteredLogs.length;
  const infoCount = userLogins.length; // Info = user logins
  const warningCount = 0;

  const openSummaryModal = (type: "logs" | "userLogins") => {
    setModalType(type);
    setIsSummaryView(true);
    if (type === "logs") {
      setModalLogs(rawLogs);
      setModalTitle("Todos los Logs (ERROR)");
    } else {
      setModalLogs([]);
      setModalTitle("Usuarios conectados recientes");
    }
    setModalOpen(true);
  };

  const openIndividualModal = (log: Log) => {
    setModalType("logs");
    setIsSummaryView(false);
    setModalLogs([log]);
    setModalTitle("Detalle de Log");
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  return (
    <div className="admin-logs">
      <TopControl title="🚀 Panel de Administración" />

      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Buscar logs por usuario o acción..."
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
          <option value="ERROR">Error</option>
        </select>
        <label className="date-label">Desde:</label>
        <input
          type="date"
          className="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label className="date-label">Hasta:</label>
        <input
          type="date"
          className="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* KPI */}
      <div className="summary">
        {/* Aquí es donde aparece el número de logins recientes (infoCount) */}
        <div className="card info" onClick={() => openSummaryModal("userLogins")}>
          ℹ️ Logins recientes: {infoCount}
        </div>
        <div className="card warning">⚠️ Warnings: {warningCount}</div>
        <div className="card error" onClick={() => openSummaryModal("logs")}>
          ❌ Errores: {errorCount}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modalOverlay" onClick={closeModal}>
          <div className="modalContent animate" onClick={(e) => e.stopPropagation()}>
            <button className="modalClose" onClick={closeModal}>×</button>
            <h2>{modalTitle} ({modalType === "logs" ? modalLogs.length : userLogins.length} en total)</h2>
            
            {modalType === "logs" ? (
              // ... Tabla de Logs (sin cambios)
              <table className="modal-logs-table">
                <thead>
                  <tr>
                    {isSummaryView && <th># ID</th>}
                    <th>📅 Fecha</th>
                    <th>👤 Usuario/Módulo</th>
                    <th>⚡ Acción/Mensaje</th>
                  </tr>
                </thead>
                <tbody>
                  {modalLogs.length > 0 ? modalLogs.map((log) => (
                    <tr key={log.id}>
                      {isSummaryView && <td>{log.id}</td>}
                      <td>{log.fecha}</td>
                      <td>{log.usuario}</td>
                      <td className="modal-accion">{log.accion}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                        No hay logs para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              // *** TABLA DE LOGINS RECIENTES (userLogins) ***
              <table className="modal-logs-table">
                <thead>
                  <tr>
                    <th>ID Login</th>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Fecha de Login</th>
                  </tr>
                </thead>
                <tbody>
                  {userLogins.length > 0 ? userLogins.map(l => (
                    <tr key={l.id}>
                      <td>{l.id}</td>
                      <td>{l.username}</td>
                      <td>{l.email || "-"}</td>
                      <td>{new Date(l.created_at).toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>No hay logins recientes.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tabla Principal */}
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>📅 Fecha</th>
              <th>👤 Usuario/Módulo</th>
              <th>⚡ Acción/Mensaje</th>
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
                    <span
                      className={`badge error clickable-badge`}
                      onClick={() => openIndividualModal(log)}
                    >
                      ❌ ERROR
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                  No se encontraron logs que coincidan con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}