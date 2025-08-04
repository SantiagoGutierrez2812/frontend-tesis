import styles from './rank.module.css';
import materialImg from '../../assets/map/Imagen de WhatsApp 2025-07-31 a las 09.43.29_5a373b5f.jpg'
const HumidityWidget = () => {
  return (
    <div className={styles.text}>
      <h3>Mapa</h3>
      <img src={materialImg} alt="Material" className={styles.image} />
    </div>
  );
};

export default HumidityWidget;
