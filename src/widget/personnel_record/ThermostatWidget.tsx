import styles from './thermost.module.css';
import materialImg from '../../assets/pngwing.com.png'

const ThermostatWidget = () => {
  return (
    <div className={styles.card}>
      <div className={styles.orb}></div>
      <div className={styles.text}>
        <div className={styles.views}>Registro de</div>
        <div className={styles.label}>Personal</div>
        <img src={materialImg} alt="Material" className={styles.image} />
      </div>
    </div>
  );
};

export default ThermostatWidget;
