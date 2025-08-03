import styles from './thermost.module.css';

const ThermostatWidget = () => {
  return (
    <div className={styles.card}>
      <div className={styles.glowDot}></div>
      <div className={styles.text}>
        <div className={styles.views}>Registrar</div>
        <div className={styles.label}>Personal</div>
      </div>
    </div>
  );
};

export default ThermostatWidget;
