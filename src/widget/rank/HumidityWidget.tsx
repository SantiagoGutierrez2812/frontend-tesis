import styles from './rank.module.css';
import materialImg from '../../assets/map/map.png';
import { useNavigate } from 'react-router-dom';

const HumidityWidget = () => {
  const navigate = useNavigate();

  return (
    <div
      className={styles.text}
      onClick={() => navigate('/mapa')}
      style={{ cursor: 'pointer' }}
    >
      <h3>Mapa</h3>
      <img src={materialImg} alt="Material" className={styles.image} />
    </div>
  );
};  

export default HumidityWidget;
