import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom"; // 👈 importar
import styles from "./InventarioDashboard.module.css";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // 👈 inicializar

  const handleLogin = async () => {
    try {
      const data = await login(username, password);

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        if (data.role) localStorage.setItem("role", data.role.toString());

        setError("");
        setIsModalOpen(false);

        // 👇 Redirigir según el rol
        if (data.role === 1) {
          navigate("/dashboard");
        } else if (data.role === 2) {
          navigate("/registro");
        }
      } else {
        setError("Respuesta inesperada del servidor");
      }
    } catch (e: any) {
      setError(e.message || "Error en login");
    }
  };

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
      </main>

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
