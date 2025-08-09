import styles from './InventarioDashboard.module.css'; 
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

const inventoryData = {
  norte: [
    { material: 'Cemento', cantidad: 50 },
    { material: 'Arena', cantidad: 120 },
    { material: 'Madera', cantidad: 80 },
  ],
  sur: [
    { material: 'Ladrillos', cantidad: 300 },
    { material: 'Pintura', cantidad: 75 },
    { material: 'Tubos', cantidad: 45 },
  ],
  centro: [
    { material: 'Tornillos', cantidad: 500 },
    { material: 'Clavos', cantidad: 800 },
    { material: 'Vidrio', cantidad: 20 },
  ],
};

export default function Home() {
  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <span className={styles.companyName}>Improexprees</span>
        </div>
        <button className={styles.loginButton}>Login</button>
      </header>

      <main className={styles.mainContent}>
        <h1 className={styles.mainTitle}>Inventario</h1>
        <div className={styles.cardsContainer}>
          {/* Tarjeta 1: Tienda Norte */}
          <div className={`${styles.card} ${styles.cardNorte}`}>
            <h2 className={styles.cardTitle}>Tienda Norte</h2>
            <div className={styles.tableContainer}>
              <table className={styles.inventoryTable}>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.norte.map((item, index) => (
                    <tr key={index}>
                      <td>{item.material}</td>
                      <td>{item.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tarjeta 2: Tienda Sur */}
          <div className={`${styles.card} ${styles.cardSur}`}>
            <h2 className={styles.cardTitle}>Tienda Sur</h2>
            <div className={styles.tableContainer}>
              <table className={styles.inventoryTable}>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.sur.map((item, index) => (
                    <tr key={index}>
                      <td>{item.material}</td>
                      <td>{item.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tarjeta 3: Tienda Centro */}
          <div className={`${styles.card} ${styles.cardCentro}`}>
            <h2 className={styles.cardTitle}>Tienda Centro</h2>
            <div className={styles.tableContainer}>
              <table className={styles.inventoryTable}>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.centro.map((item, index) => (
                    <tr key={index}>
                      <td>{item.material}</td>
                      <td>{item.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.socialIcons}>
          <FaFacebook className={styles.icon} />
          <FaTwitter className={styles.icon} />
          <FaInstagram className={styles.icon} />
        </div>
      </footer>
    </div>
  );
}