// import { Link } from 'react-router-dom';
import styles from './register_and_matirial.module.css';
import materialImg from '../../assets/material/pngwing.com (1).png';
import { useNavigate } from 'react-router-dom';
const PowerWidget = () => {
  const navigate = useNavigate();
  return (
     <div
      
      onClick={() => navigate('/registro')}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.card}>
        <div className={styles.orb}></div>
        <div className={styles.text}>
          <div className={styles.views}>Registro de</div>
          <div className={styles.label}>material</div>
          <img src={materialImg} alt="Material" className={styles.image} />
        </div>
      </div>
    </div>
  );
};

export default PowerWidget;

