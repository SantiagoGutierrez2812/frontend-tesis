import PowerWidget from '../widget/stores/PowerWidget';
import ThermostatWidget from '../widget/personnel_record/ThermostatWidget';
import HumidityWidget from '../widget/rank/HumidityWidget';
import styles from './Dashboard.module.css';

const Dashboard = () => {
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
