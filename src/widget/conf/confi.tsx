// components/ConfiWidget/ConfiWidget.tsx
import './confi.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { get_all_logs } from '../../services/log/log'; 
import type { LogRecord } from '../../services/types/log/log';
import { AlertTriangle, Users } from 'lucide-react';
import { getAppUsers } from "../../services/user_logins/UserLogins"; 
import type { AppUser } from "../../services/types/user_logins/UserLogin";

const ConfiWidget = () => {
  const navigate = useNavigate();
  const [logCount, setLogCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);

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

    fetchLogs();
    fetchUsers();
  }, []);

  return (
    <div onClick={() => navigate('/adminLogs')} style={{ cursor: 'pointer' }}>
      <div className="espacio3D">
        <div className="cubo3D">
          <div className="base"></div>

          {/* Cara principal */}
          <aside className="cara cara1">Administración</aside>

          {/* Cara con ícono y contador de logs */}
          <aside className="cara cara2">
            <div className="error-container">
              <AlertTriangle className="error-icon" />
              <span className="error-count">{logCount}</span>
            </div>
          </aside>

          {/* Cara con ícono y contador de usuarios */}
          <aside className="cara cara3">
            <div className="user-container">
              <Users className="user-icon" />
              <span className="user-count">{userCount}</span>
            </div>
          </aside>

          {/* Otras caras vacías */}
          <aside className="cara cara4"></aside>
          <aside className="cara cara5"></aside>
          <aside className="cara cara6"></aside>
        </div>
      </div>
    </div>
  );
};

export default ConfiWidget;
