// components/ConfiWidget/ConfiWidget.tsx
import "./confi.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { get_all_logs } from "../../services/log/log";
import type { LogRecord } from "../../services/types/log/log";
import { AlertTriangle, Users, ShoppingCart } from "lucide-react";
import { getAppUsers } from "../../services/user_logins/UserLogins";
import type { AppUser } from "../../services/types/user_logins/UserLogin";
import { getTransactions } from "../../services/Product_Transactions/Transactions";
import type { Transaction } from "../../services/types/Product_Transactions/transaction";

const ConfiWidget = () => {
  const navigate = useNavigate();
  const [logCount, setLogCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [setLastTransactionId] = useState<number | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logs: LogRecord[] = await get_all_logs();
        setLogCount(Array.isArray(logs) ? logs.length : 0);
      } catch (error) {
        console.error("Error al obtener logs:", error);
        setLogCount(0);
      }
    };

    const fetchUsers = async () => {
      try {
        const users: AppUser[] = await getAppUsers();
        setUserCount(Array.isArray(users) ? users.length : 0);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        setUserCount(0);
      }
    };

    const fetchTransactions = async () => {
      try {
        const transactions: Transaction[] = await getTransactions();
        setTransactionCount(transactions.length);

        if (transactions.length > 0) {
          const last = transactions[transactions.length - 1];

        }
      } catch (error) {
        console.error("Error al obtener transacciones:", error);
        setTransactionCount(0);

      }
    };

    fetchLogs();
    fetchUsers();
    fetchTransactions();
  }, []);

  return (
    <div onClick={() => navigate("/adminLogs")} style={{ cursor: "pointer" }}>
      <div className="espacio3D">
        <div className="cubo3D">
          <div className="base"></div>

          <aside className="cara cara1">Administración</aside>

          <aside className="cara cara2">
            <div className="error-container">
              <AlertTriangle className="error-icon" />
              <p>ERRORES</p>
              <span className="error-count">{logCount}</span>
            </div>
          </aside>

          <aside className="cara cara3">
            <div className="user-container">
              <Users className="user-icon" />
              <p>ACCESOS AL SISTEMA</p>
              <span className="user-count">{userCount}</span>
            </div>
          </aside>

          {/* Cara 4: muestra total y último ID */}
          <aside className="cara cara4">
            <div className="transaction-container">
              <ShoppingCart className="transaction-icon" />
              <p>TRANSACCIONES</p>
              <span className="transaction-count">{transactionCount}</span>
             
            </div>
          </aside>

          <aside className="cara cara5"></aside>
          <aside className="cara cara6"></aside>
        </div>
      </div>
    </div>
  );
};

export default ConfiWidget;
