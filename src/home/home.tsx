// Home.tsx

import { useState, useEffect } from "react";
import { login } from "../services/authservice/authService";
import { useNavigate } from "react-router-dom";
import styles from "./InventarioDashboard.module.css";
import { getCompanyName } from "../services/companies/app_companies";
import type { Company, CompaniesResponse } from "../services/companies/app_companies";
import { getInventories } from  "../services/inventory/app_inventario"
import type { Inventory, InventoriesResponse } from "../services/inventory/app_inventario"
import { toast} from "react-toastify";

// import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const companiesData: CompaniesResponse = await getCompanyName();
        if (companiesData.ok && companiesData.companies) {
          setCompanies(companiesData.companies);
        }

        const inventoriesData: InventoriesResponse = await getInventories();
        if (inventoriesData.ok && inventoriesData.inventories) {
          setInventories(inventoriesData.inventories);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    }
    fetchData();
  }, []);

const handleLogin = async () => {
  try {
    const data = await login(username, password);
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", String(data.role));
      localStorage.setItem("welcome", username);
      toast.success(`¡Bienvenido, ${username}! 👋`, {
        position: "top-right",
        autoClose: 5000,
      });

      if (data.role === 1) {
        navigate("/dashboard");
      } else if (data.role === 2) {
        navigate("/registro");
      }

      setError("");
      setIsModalOpen(false);
    } else {
      setError("Respuesta inesperada del servidor");
    }
  } catch (e: any) {
    setError(e.message || "Error en login");
    toast.error("❌ Error al iniciar sesión", { position: "top-right" });
  }
};

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <span className={styles.companyName}>
            {companies[0]?.name || "Improexprees"}
          </span>
        </div>
        <button
          className={styles.loginButton}
          onClick={() => setIsModalOpen(true)}
        >
          Login
        </button>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <h1 className={styles.mainTitle}>Inventario</h1>

        <div className={styles.cardsContainer}>
          {companies.map((company) => (
            <div key={company.id} className={styles.card}>
              <h2 className={styles.cardTitle}>{company.name}</h2>

              <table className={styles.inventoryTable}>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {inventories.filter(inv => inv.branch_id === company.id).length > 0 ? (
                    inventories
                      .filter(inv => inv.branch_id === company.id)
                      .map((inv, index) => (
                        <tr key={index}>
                          <td>{inv.product_name}</td>
                          <td>{inv.quantity}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={2}>Sin inventario</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.socialIcons}>
          <span className={`${styles.icon} fa fa-facebook`} />
          <span className={`${styles.icon} fa fa-twitter`} />
          <span className={`${styles.icon} fa fa-instagram`} />
        </div>
      </footer>

      {/* Modal Login */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {!isRecovery ? (
              <>
                <h2>Iniciar Sesión</h2>
                <input
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.inputField}
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.inputField}
                />
                <button className={styles.primaryButton} onClick={handleLogin}>
                  Entrar
                </button>
                {error && <p style={{ color: "red" }}>{error}</p>}
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
                <button className={styles.primaryButton}>Enviar enlace</button>
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
