import { useState } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  return (
    
    <div className={styles.pageContainer}>

      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <span className={styles.companyName}>Improexprees</span>
        </div>
        <button 
          className={styles.loginButton} 
          onClick={() => setIsModalOpen(true)}
        >
          Login
        </button>
      </header>

      <main className={styles.mainContent}>
        <h1 className={styles.mainTitle}>Inventario</h1>
        <div className={styles.cardsContainer}>
          {/* Tarjetas del inventario */}
          {Object.entries(inventoryData).map(([zona, items], idx) => (
            <div 
              key={idx} 
              className={`${styles.card} ${styles[`card${zona.charAt(0).toUpperCase() + zona.slice(1)}`]}`}
            >
              <h2 className={styles.cardTitle}>
                Tienda {zona.charAt(0).toUpperCase() + zona.slice(1)}
              </h2>
              <div className={styles.tableContainer}>
                <table className={styles.inventoryTable}>
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.material}</td>
                        <td>{item.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.socialIcons}>
          <FaFacebook className={styles.icon} />
          <FaTwitter className={styles.icon} />
          <FaInstagram className={styles.icon} />
        </div>
      </footer>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {!isRecovery ? (
              <>
                <h2>Iniciar Sesión</h2>
                <input 
                  type="text" 
                  placeholder="Usuario" 
                  className={styles.inputField} 
                />
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  className={styles.inputField} 
                />
                <button className={styles.primaryButton}>Entrar</button>
                <button 
                  className={styles.linkButton} 
                  onClick={() => setIsRecovery(true)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <button 
                  className={styles.closeButton} 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cerrar
                </button>
              </>
            ) : (
              <>
                <h2>Recuperar Contraseña</h2>
                <input 
                  type="email" 
                  placeholder="Correo electrónico" 
                  className={styles.inputField} 
                />
                <button className={styles.primaryButton}>
                  Enviar enlace
                </button>
                <button 
                  className={styles.linkButton} 
                  onClick={() => setIsRecovery(false)}
                >
                  Volver al login
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
