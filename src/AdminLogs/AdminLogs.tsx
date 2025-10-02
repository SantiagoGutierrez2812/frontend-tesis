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

    const [modalOpen, setModalOpen] = useState<boolean>(false);
    // Usaremos filteredLogs para la vista resumen y el log específico para el detalle.
    const [modalLogs, setModalLogs] = useState<Log[]>([]); 
    const [modalTitle, setModalTitle] = useState<string>("");
    // Nuevo estado para diferenciar el origen del modal
    const [isSummaryView, setIsSummaryView] = useState<boolean>(false); 

    useEffect(() => {
        setLogs(mockLogs);
    }, []);

    const filteredLogs = logs.filter((log) => {
        const logDate = new Date(log.fecha.split(" ")[0]);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        const matchesSearch =
            log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    // FUNCIÓN 1: Para el clic en la tabla (Badge de fila) - Muestra SOLO el log específico
    const openModal = (log: Log) => {
        setIsSummaryView(false); // Vista de detalle individual
        setModalLogs([log]); 
        setModalTitle(log.tipo);
        setModalOpen(true);
    };

    // FUNCIÓN 2: Para el clic en las tarjetas de resumen - Muestra TODOS los logs del tipo
    const openSummaryModal = (type: LogType) => {
        setIsSummaryView(true); // Vista de resumen
        // Filtra los logs en base a los logs filtrados actualmente
        setModalLogs(filteredLogs.filter((l) => l.tipo === type)); 
        setModalTitle(type);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    // La lógica de mostrar detalles completos (Acción) se aplica SOLO si es ERROR, independientemente del origen.
    const showFullDetails = modalTitle === "ERROR";

    return (
        <div className="admin-logs">
            <TopControl title="🚀 Panel de Administración" />

            {/* ... Filters Section ... */}
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

            {/* Tarjetas de resumen: Restauramos el onClick con la nueva función openSummaryModal */}
            <div className="summary">
                <div className="card info" onClick={() => openSummaryModal("INFO")}>
                    ℹ️ Info: {filteredLogs.filter((l) => l.tipo === "INFO").length}
                </div>
                <div className="card warning" onClick={() => openSummaryModal("WARNING")}>
                    ⚠️ Warnings: {filteredLogs.filter((l) => l.tipo === "WARNING").length}
                </div>
                <div className="card error" onClick={() => openSummaryModal("ERROR")}>
                    ❌ Errores: {filteredLogs.filter((l) => l.tipo === "ERROR").length}
                </div>
            </div>

            {modalOpen && (
                <div className="modalOverlay" onClick={closeModal}>
                    <div className="modalContent animate" onClick={(e) => e.stopPropagation()}>
                        <button className="modalClose" onClick={closeModal}>×</button>
                        <h2>{modalTitle} Log {isSummaryView ? "Resumen" : "Detallado"}</h2>
                        <table className="modal-logs-table">
                            <thead>
                                <tr>
                                    {/* En resumen (isSummaryView=true), mostramos TODAS las columnas */}
                                    {isSummaryView && <th># ID</th>} 
                                    <th>📅 Fecha</th>
                                    <th>👤 Usuario</th>
                                    {/* Si es Resumen O si es Detalle de ERROR, mostramos Acción */}
                                    {(isSummaryView || showFullDetails) && <th>⚡ Acción</th>} 
                                </tr>
                            </thead>
                            <tbody>
                                {modalLogs.length > 0 ? modalLogs.map((log) => (
                                    // Usamos el ID del log real como key
                                    <tr key={log.id}> 
                                        {isSummaryView && <td>{log.id}</td>}
                                        <td>{log.fecha}</td>
                                        <td>{log.usuario}</td>
                                        {(isSummaryView || showFullDetails) && <td>{log.accion}</td>}
                                    </tr>
                                )) : (
                                    <tr>
                                        {/* Ajustamos colSpan para la vista de resumen (4 columnas) o detalle (2 o 3 columnas) */}
                                        <td colSpan={isSummaryView ? 4 : (showFullDetails ? 3 : 2)} style={{ textAlign: "center", padding: "20px" }}>
                                            No hay logs para mostrar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tabla Principal */}
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
                                        {/* Badge: Usa openModal para el detalle individual */}
                                        <span 
                                            className={`badge ${getBadgeColor(log.tipo)} clickable-badge`} 
                                            onClick={() => openModal(log)}
                                        >
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
        </div>
    );
}