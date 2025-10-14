import React, { useState, useEffect, useMemo } from "react";
import TopControl from "../TopControl/TopControl";
import { get_all_logs } from "../services/log/log";
import { getUserLogins, getAppUsers } from "../services/user_logins/UserLogins";
import { getTransactions } from "../services/Product_Transactions/Transactions";
import type { LogRecord } from "../services/types/log/log";
import type { UserLogin } from "../services/types/user_logins/UserLogin";
import type { Transaction } from "../services/types/Product_Transactions/transaction";
import "./AdminLogs.css";

// === Utilidad para formatear fechas ===
const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

// === Tipos de logs ===
type LogType = "ERROR" | "TRANSACCIÓN" | "LOGIN";

export interface Log {
  id: number;
  fecha: string;
  usuario: string;
  accion: string;
  tipo: LogType;
  branch?: string;
  product?: string;
  transactionType?: string;
}

// === Tipo combinado para logins con info de usuario ===
type UserLoginWithUser = {
  id: number;
  app_user_id: number;
  created_at: string;
  app_user_username?: string;
  app_user_email?: string;
  role?: string;
};

// === Mapeo de logs del backend ===
function mapLogRecord(record: Partial<LogRecord>): Log {
  const message = record.message || "Sin mensaje";
  const modulePath = record.module || "sistema";
  const moduleParts = modulePath.split(".");
  const moduleName = moduleParts[moduleParts.length - 1] || "sistema";
  const createdAt = record.created_at || new Date().toISOString();

  return {
    id: record.id || Math.floor(Math.random() * 100000),
    fecha: new Date(createdAt).toISOString(),
    usuario: moduleName,
    accion: message,
    tipo: "ERROR",
  };
}

// === Mapeo de transacciones ===
function mapTransactionRecord(tx: Transaction): Log {
  const fechaISO = new Date(tx.created_at ?? tx.transaction_date ?? Date.now()).toISOString();
  const descripcion = tx.description || "Sin descripción";

  return {
    id: tx.id,
    fecha: fechaISO,
    usuario: (tx as any).app_user_name || "Usuario desconocido",
    accion: `${descripcion} — ${(tx as any).product || "Producto no especificado"}`,
    tipo: "TRANSACCIÓN",
    branch: (tx as any).branch_name || "Sucursal desconocida",
    product: (tx as any).product || "N/A",
    transactionType: (tx as any).transaction_type_name || "N/A",
  };
}

// === Mapeo de logins a logs ===
function mapLoginToLog(login: UserLoginWithUser): Log {
  return {
    id: login.id,
    fecha: login.created_at,
    usuario: login.app_user_username || "Usuario desconocido", // <-- fallback
    accion: "Inicio de sesión",
    tipo: "LOGIN",
  };
}

export default function AdminLogs() {
  const [rawLogs, setRawLogs] = useState<Log[]>([]);
  const [transactions, setTransactions] = useState<Log[]>([]);
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

  // === Cargar logs ===
  useEffect(() => {
    async function fetchLogs() {
      try {
        const records: LogRecord[] = await get_all_logs();
        const mappedLogs = records.map(mapLogRecord);
        setRawLogs(mappedLogs);
      } catch (error) {
        console.error("Error al obtener logs:", error);
      }
    }
    fetchLogs();
  }, []);

  // === Cargar transacciones ===
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const txs = await getTransactions();
        const mappedTxs = txs.map(mapTransactionRecord);
        setTransactions(mappedTxs);
      } catch (err) {
        console.error("Error al cargar transacciones:", err);
      }
    }
    fetchTransactions();
  }, []);

  // === Cargar user logins ===
  useEffect(() => {
    async function fetchUserLogins() {
      try {
        const [logins, users] = await Promise.all([getUserLogins(), getAppUsers()]);
        const loginsWithUser: UserLoginWithUser[] = logins.map((login: any) => {
          const user = users.find((u: any) => u.id === login.app_user_id);
          return {
            id: login.id,
            app_user_id: login.app_user_id,
            created_at: login.created_at,
            app_user_username: login["app_user_username "] || user?.username || "N/A",
            app_user_email: login["app_user_email "] || user?.email || "N/A",
            role: user?.role ? String(user.role) : undefined,
          };
        });
        setUserLogins(loginsWithUser);
      } catch (err) {
        console.error("Error al cargar logins de usuarios:", err);
      }
    }
    fetchUserLogins();
  }, []);

  // === Combinar logs + transacciones + logins ===
  const combinedLogs = useMemo(() => {
    const loginLogs = userLogins.map(mapLoginToLog);
    const all = [...rawLogs, ...transactions, ...loginLogs];
    return all.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [rawLogs, transactions, userLogins]);

  // === Filtro principal ===
  const filteredLogs = useMemo(() => {
    return combinedLogs.filter((log) => {
      const logDate = new Date(log.fecha);
      const start = startDate ? new Date(startDate + "T00:00:00") : null;
      const end = endDate ? new Date(endDate + "T23:59:59") : null;

      const matchesSearch =
        log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.accion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === "Todos" || log.tipo === filterType;

      const matchesDate = (!start || logDate >= start) && (!end || logDate <= end);

      return matchesSearch && matchesType && matchesDate;
    });
  }, [combinedLogs, searchTerm, filterType, startDate, endDate]);

  // === Contadores ===
  const errorCount = rawLogs.length;
  const infoCount = userLogins.length;
  const transactionCount = transactions.length;

  const openSummaryModal = (type: "logs" | "userLogins") => {
    setModalType(type);
    setIsSummaryView(true);
    if (type === "logs") {
      setModalLogs(combinedLogs);
      setModalTitle("Resumen de Logs y Transacciones");
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
    setModalTitle("Detalle de Log / Transacción");
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
          placeholder="🔍 Buscar por usuario, acción o descripción..."
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
          <option value="TRANSACCIÓN">Transacción</option>
          <option value="LOGIN">Login</option>
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

      {/* KPIs */}
      <div className="summary">
        <div className="card info" onClick={() => openSummaryModal("userLogins")}>
          ℹ️ Logins recientes: {infoCount}
        </div>
        <div
          className="card warning"
          onClick={() => {
            setModalType("logs");
            setIsSummaryView(true);
            setModalLogs(transactions);
            setModalTitle("Resumen de Transacciones");
            setModalOpen(true);
          }}
        >
          💳 Transacciones: {transactionCount}
        </div>
        <div className="card error" onClick={() => openSummaryModal("logs")}>
          ❌ Errores: {errorCount}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modalOverlay" onClick={closeModal}>
          <div className="modalContent animate" onClick={(e) => e.stopPropagation()}>
            <button className="modalClose" onClick={closeModal}>×</button>
            <h2>{modalTitle}</h2>

            {modalType === "userLogins" ? (
              <table className="modal-logs-table">
                <thead>
                  <tr>
                    <th>📅 Fecha</th>
                    <th>👤 Usuario</th>
                    <th>📧 Email</th>
                  </tr>
                </thead>
                <tbody className="logs-table">
                  {userLogins.length > 0 ? (
                    userLogins.map((login) => (
                      <tr key={login.id}>
                        <td>{formatDate(login.created_at)}</td>
                        <td>{login.app_user_username}</td>
                        <td>{login.app_user_email}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center" }}>
                        No hay registros de logins recientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="modal-logs-table">
                <thead>
                  <tr>
                    <th>📅 Fecha</th>
                    <th>👤 Usuario</th>
                    <th>🏢 Sucursal</th>
                    <th>🛒 Producto</th>
                    <th>⚡ Descripción / Acción</th>
                    <th>📌 Tipo</th>
                  </tr>
                </thead>
                <tbody className="logs-table">
                  {modalLogs.length > 0 ? (
                    modalLogs.map((log, index) => (
                      <tr key={`${log.tipo}-${log.id}-${index}`}>
                        <td>{formatDate(log.fecha)}</td>
                        <td>{log.usuario}</td>
                        <td>{(log as any).branch || "-"}</td>
                        <td>{(log as any).product || "-"}</td>
                        <td>{log.accion}</td>
                        <td>{(log as any).transactionType || log.tipo}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }}>
                        No hay registros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tabla principal */}
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>📅 Fecha</th>
              <th>👤 Usuario</th>
              <th>🏢 Sucursal</th>
              <th>🛒 Producto</th>
              <th>⚡ Descripción / Acción</th>
              <th>📌 Tipo</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={`${log.tipo}-${log.id}`}>
                  <td>{formatDate(log.fecha)}</td>
                  <td>{log.usuario}</td>
                  <td>{log.branch || "-"}</td>
                  <td>{log.product || "-"}</td>
                  <td>{log.accion}</td>
                  <td>
                    <span
                      className={`badge ${log.tipo === "ERROR"
                        ? "error"
                        : log.tipo === "TRANSACCIÓN"
                          ? "warning"
                          : "info"
                        } clickable-badge`}
                      onClick={() => openIndividualModal(log)}
                    >
                      {log.tipo === "ERROR"
                        ? "❌ ERROR"
                        : log.tipo === "TRANSACCIÓN"
                          ? "💳 TRANSACCIÓN"
                          : "ℹ️ LOGIN"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
