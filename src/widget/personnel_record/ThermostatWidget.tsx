import styles from './thermost.module.css';
import materialImg from '../../assets/pngwing.com.png';
import { useNavigate } from 'react-router-dom';

const ThermostatWidget = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper} onClick={() => navigate('/registro_personal')}>
      <div className={styles.card}>
        <div className={styles.light}></div>
        <div className={styles.border}></div>
        <div className={styles.text}>
          <div className={styles.views}>Registro de</div>
          <div className={styles.label}>Personal</div>
          <img src={materialImg} alt="Material" className={styles.image} />
        </div>
      </div>
    </div>
  );
};

export default ThermostatWidget;