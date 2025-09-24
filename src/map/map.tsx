import styles from './map.module.css';
import mapaImg from '../assets/map/Gemini_Generated_Image_ycymjvycymjvycym.jpeg';
import { useNavigate } from 'react-router-dom';
import TopControl from "../TopControl/TopControl";


const markers = [
  { id: 1, name: 'Sede Central', stock: '75%', x: 60, y: 40 },
  { id: 2, name: 'Sede Norte', stock: '24%', x: 30, y: 55 },
];

export default function MapaFondo() {
  const navigate = useNavigate();

  return (
    <div className={styles.mapContainer}>
           <TopControl title="🚀 Sedes Improexprees" />
      <img
        src={mapaImg}
        alt="Mapa"
        className={styles.mapImage}
        draggable={false}
      />

      <div className={`${styles.epicTitle} ${styles.flagContainer}`}>
        <div className={styles.logo}>Sedes Improexprees</div>
      </div>

      {/* Puntos */}
      {markers.map((m) => (
        <div
          key={m.id}
          className={styles.marker}
          style={{ top: `${m.y}%`, left: `${m.x}%` }}
          tabIndex={0}
          aria-label={`${m.name} stock ${m.stock}`}
          onClick={() => navigate('/headquarters')}
        >
          <div className={styles.dot} />
          <div className={styles.tooltip}>
            <strong>{m.name}</strong>
            <br />
            Stock: {m.stock}
          </div>
        </div>
      ))}
    </div>
  );
}
