
import PowerWidget from '../widget/stores/PowerWidget';
import ThermostatWidget from '../widget/personnel_record/ThermostatWidget';
import HumidityWidget from '../widget/rank/HumidityWidget';
import styles from './Dashboard.module.css';
import ConfiWidget from '../widget/conf/confi'

const Dashboard = () => {
    const userName = "Juan Pérez"; 

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
                        
                    </div>
                </div>
                {/* Nuevo contenedor para el menú de opciones */}
                <div className={styles.dashboardMenuBox}>
                    <div className={styles.menuItem}>
                        <span className={styles.menuIcon}>👤</span>
                        <span className={styles.menuText}>{userName}</span>
                    </div>
                    <div className={styles.menuItem}>
                        <span className={styles.menuIcon}>⚙️</span>
                        <span className={styles.menuText}>Configuración</span>
                    </div>
                    <div className={styles.menuItem}>
                        <span className={styles.menuIcon}>🚪</span>
                        <span className={styles.menuText}>Cerrar sesión</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;