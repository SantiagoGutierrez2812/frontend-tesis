import styles from './thermost.module.css';
import materialImg from '../../assets/pngwing.com.png'
import { useNavigate } from 'react-router-dom';
const ThermostatWidget = () => {
   const navigate = useNavigate();
  return (
    <div
      className={styles.card}
      onClick={() => navigate('/registro_personal')}
      style={{ cursor: 'pointer' }}
    >
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
