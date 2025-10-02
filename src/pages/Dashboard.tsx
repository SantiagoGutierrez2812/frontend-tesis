// src/pages/Dashboard.tsx
import { useNavigate } from 'react-router-dom'; // 1. Importar useNavigate
import { logout } from '../utils/auth';         // 2. Importar la función logout
import PowerWidget from '../widget/stores/PowerWidget';
import ThermostatWidget from '../widget/personnel_record/ThermostatWidget';
import HumidityWidget from '../widget/rank/HumidityWidget';
import styles from './Dashboard.module.css';
import ConfiWidget from '../widget/conf/confi'
import Loader from '../widget/supplier/supplier'

const Dashboard = () => {
    const userName = "Juan Pérez"; 
    const navigate = useNavigate(); // Inicializar useNavigate

    // Función para manejar el cierre de sesión
    const handleLogout = () => {
        logout(); // Elimina el token y el rol de localStorage
        navigate("/", { replace: true }); // Redirige al Home (Login) y reemplaza el historial
    };

    return (
        <div className={styles.backgroundWrapper}>
            <div className={styles.backgroundBlur}></div>
            <div className={styles.dashboardContent}>
                <div className={styles.dashboardBox}>
                    <h1 className={styles.goldTitle}>Improexprees</h1>
                    <div className={styles.widgetContainer}>
                        <div className={styles.widgetBox}><PowerWidget /></div>
                        <div className={styles.widgetBox}><ThermostatWidget /></div>
                        <div className={styles.widgetBox}><HumidityWidget /></div>
                        <div className={styles.widgetBox}><ConfiWidget /></div>
                        <div className={styles.widgetBox}><Loader /></div>
                    </div>
                </div>
                {/* Contenedor para el menú de opciones */}
                <div className={styles.dashboardMenuBox}>
                    <div className={styles.menuItem}>
                        <span className={styles.menuIcon}>👤</span>
                        <span className={styles.menuText}>{userName}</span>
                    </div>
                    {/* Opción de Configuración (solo placeholder) */}
                    <div 
                        className={styles.menuItem}
                        onClick={() => alert("Función de Configuración aún no implementada.")}
                    >
                        <span className={styles.menuIcon}>⚙️</span>
                        <span className={styles.menuText}>Configuración</span>
                    </div>
           
                    <div 
                        className={styles.menuItem}
                        onClick={handleLogout}
                        role="button" 
                        tabIndex={0} 
                    >
                        <span className={styles.menuIcon}>🚪</span>
                        <span className={styles.menuText}>Cerrar sesión</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;