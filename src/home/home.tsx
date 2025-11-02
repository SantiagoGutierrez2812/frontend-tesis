import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./InventarioDashboard.module.css";

import {
  login,
  verifyOtp,
  forgotPassword,
  verifyOtpPassword,
  resetPassword,
  type LoginSuccessResponse,
} from "../services/authservice/authService";

import { getBranches } from "../services/branchService/branchService";
import type { Branch } from "../services/types/branch/branchService";
import { getInventories } from "../services/inventory/app_inventario";
import { FaInstagram } from "react-icons/fa";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [isVerificationStep, setIsVerificationStep] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // Recuperación de contraseña
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [isResetStep, setIsResetStep] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [inventories, setInventories] = useState<any[]>([]);

  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 🕒 CONTADOR OTP (Login y Recuperación)
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    if (!isTimerActive) return;
    if (timeLeft <= 0) {
      setIsTimerActive(false);
      toast.error("⏰ El código ha expirado, solicita uno nuevo.");
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTimerActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 🧩 Datos iniciales
  useEffect(() => {
    async function fetchData() {
      try {
        const [branchesData, inventoriesData] = await Promise.all([
          getBranches(),
          getInventories(),
        ]);
        setBranches(branchesData);
        if (inventoriesData.ok && inventoriesData.inventories)
          setInventories(inventoriesData.inventories);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    }
    fetchData();
  }, []);

  // 🪶 Fondo partículas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    interface Particle {
      x: number;
      y: number;
      radius: number;
      dx: number;
      dy: number;
    }

    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
    }));

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fill();
      }
      requestAnimationFrame(animate);
    };
    animate();
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Login
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const data = await login(username, password);
      if (data.ok) {
        setIsVerificationStep(true);
        setIsTimerActive(true);
        setTimeLeft(600); // reiniciar contador
        toast.info(`Te enviamos un código a tu correo. ${data.message}`);
      }
    } catch (e: any) {
      toast.error(e.message || "Error al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Login
  const handleVerifyCode = async () => {
    if (timeLeft <= 0) {
      toast.error("El código ha expirado, solicita uno nuevo.");
      return;
    }

    if (verificationCode.trim().length < 4) {
      toast.error("El código debe tener al menos 4 dígitos.");
      return;
    }
    setIsLoading(true);
    try {
      const result: LoginSuccessResponse = await verifyOtp(username, verificationCode.trim());
      if (result.ok) {
        toast.success("✅ Código verificado correctamente");
        setIsModalOpen(false);
        setIsVerificationStep(false);
        setIsTimerActive(false);
        const role = localStorage.getItem("role");
        if (role === "1") navigate("/dashboard");
        else if (role === "2") navigate("/registro");
        else navigate("/no-autorizado");
      } else toast.error("Código inválido o error al verificar.");
    } catch (e: any) {
      toast.error(e.message || "Error al verificar código.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Recuperación
  const handleSendRecoveryEmail = async () => {
    if (!recoveryEmail) return toast.error("Ingresa un correo válido.");
    setIsLoading(true);
    try {
      const res = await forgotPassword(recoveryEmail);
      toast.info(res.message);
      setIsOtpStep(true);
      setIsTimerActive(true);
      setTimeLeft(600);
    } catch (e: any) {
      toast.error(e.message || "Error enviando correo de recuperación.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpRecovery = async () => {
    if (timeLeft <= 0) {
      toast.error("El código ha expirado, solicita uno nuevo.");
      return;
    }
    if (!otpCode || otpCode.length < 4) {
      toast.error("Ingresa un código válido.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await verifyOtpPassword(recoveryEmail, otpCode);
      if (res.ok) {
        toast.success(res.message);
        setIsOtpStep(false);
        setIsResetStep(true);
        setIsTimerActive(false);
      }
    } catch (e: any) {
      toast.error(e.message || "Error verificando código OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6)
      return toast.error("❌ La contraseña debe tener al menos 6 caracteres.");
    if (newPassword !== confirmPassword)
      return toast.error("❌ Las contraseñas no coinciden.");
    setIsLoading(true);
    try {
      const res = await resetPassword(recoveryEmail, otpCode, newPassword, confirmPassword);
      if (res.ok) {
        toast.success(res.message);
        setIsResetStep(false);
        setIsRecovery(false);
        setIsModalOpen(false);
      }
    } catch (e: any) {
      toast.error(e.message || "Error al cambiar la contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <canvas ref={canvasRef} className={styles.particlesCanvas}></canvas>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <span className={styles.epicText}>IMPROEXPRESS</span>
        </div>
        <button className={styles.loginButton} onClick={() => setIsModalOpen(true)}>
          Login
        </button>
      </header>

      {/* Contenido principal */}
      <main className={styles.mainContent}>
        <div className={styles.loaderWrapper}>
          <p className={styles.loader}>
            <span>Inventario</span>
          </p>
        </div>

        <div className={styles.cardsContainer}>
          {branches.map((branch) => {
            const branchInventories = inventories.filter(
              (inv) => inv.branch_id === branch.id
            );
            return (
              <div key={branch.id} className={styles.card}>
                <h2 className={styles.cardTitle}>{branch.name}</h2>
                <div className={styles.tableScroll}>
                  <table className={styles.inventoryTable}>
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branchInventories.length > 0 ? (
                        branchInventories.map((inv, index) => (
                          <tr key={index}>
                            <td className={styles.text5}>{inv.product_name}</td>
                            <td className={styles.text5}>{inv.quantity}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className={styles.text5}>
                            Sin inventario
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.socialIcons}>
          <a
            href="https://www.instagram.com/improexpresspublicidad/?hl=es"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram className={styles.icon} />
          </a>
        </div>
      </footer>

      {/* MODAL LOGIN / OTP / RECUPERACIÓN */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {!isRecovery ? (
              !isVerificationStep ? (
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
                  <button
                    className={styles.primaryButton}
                    onClick={handleLogin}
                    disabled={isLoading || !username || !password}
                  >
                    {isLoading ? "Cargando..." : "Entrar"}
                  </button>
                  <button
                    className={styles.linkButton}
                    onClick={() => setIsRecovery(true)}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  <button
                    className={styles.closeButton}
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsVerificationStep(false);
                      setIsRecovery(false);
                      setVerificationCode("");
                    }}
                  >
                    Cerrar
                  </button>
                </>
              ) : (
                <>
                  <h2>Verificación de Código</h2>
                  <p>
                    Ingresa el código recibido para <b>{username}</b>:
                  </p>
                  {/* 🕒 TIMER LOGIN */}
                  <p style={{ fontSize: "14px", color: "#0070ff" }}>
                    Tiempo restante: {formatTime(timeLeft)}
                  </p>

                  <input
                    type="text"
                    placeholder="Código de verificación"
                    className={styles.inputField}
                    maxLength={6}
                    inputMode="numeric"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, ""))
                    }
                    disabled={timeLeft <= 0}
                  />
                  <button
                    className={styles.primaryButton}
                    onClick={handleVerifyCode}
                    disabled={isLoading || verificationCode.length < 4 || timeLeft <= 0}
                  >
                    {isLoading ? "Verificando..." : "Verificar código"}
                  </button>

                  {timeLeft <= 0 && (
                    <button
                      className={styles.secondaryButton}
                      onClick={() => {
                        setTimeLeft(600);
                        setIsTimerActive(true);
                        toast.info("Nuevo código reenviado 📩");
                      }}
                    >
                      Reenviar código
                    </button>
                  )}
                  <button
                    className={styles.closeButton}
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsVerificationStep(false);
                      setVerificationCode("");
                    }}
                  >
                    Cerrar
                  </button>
                </>
              )
            ) : (
              <>
                {/* Recuperación */}
                {!isOtpStep && !isResetStep && (
                  <>
                    <h2>Recuperar Contraseña</h2>
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      className={styles.inputField}
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                    />
                    <button
                      className={styles.primaryButton}
                      onClick={handleSendRecoveryEmail}
                      disabled={isLoading || !recoveryEmail}
                    >
                      {isLoading ? "Enviando..." : "Enviar código"}
                    </button>
                    <button
                      className={styles.linkButton}
                      onClick={() => setIsRecovery(false)}
                    >
                      Volver al login
                    </button>
                  </>
                )}

                {isOtpStep && !isResetStep && (
                  <>
                    <h2>Verificar Código</h2>
                    <p>Revisa tu correo <b>{recoveryEmail}</b> e ingresa el código:</p>
                    <p style={{ fontSize: "14px", color: "#0070ff" }}>
                      Tiempo restante: {formatTime(timeLeft)}
                    </p>

                    <input
                      type="text"
                      placeholder="Código OTP"
                      className={styles.inputField}
                      value={otpCode}
                      maxLength={6}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      disabled={timeLeft <= 0}
                    />
                    <button
                      className={styles.primaryButton}
                      onClick={handleVerifyOtpRecovery}
                      disabled={isLoading || otpCode.length < 4 || timeLeft <= 0}
                    >
                      {isLoading ? "Verificando..." : "Verificar código"}
                    </button>

                    {timeLeft <= 0 && (
                      <button
                        className={styles.secondaryButton}
                        onClick={() => {
                          setTimeLeft(600);
                          setIsTimerActive(true);
                          toast.info("Nuevo código reenviado 📩");
                        }}
                      >
                        Reenviar código
                      </button>
                    )}
                  </>
                )}

                {isResetStep && (
                  <>
                    <h2>Cambiar Contraseña</h2>
                    <input
                      type="password"
                      placeholder="Nueva contraseña"
                      className={styles.inputField}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Confirmar contraseña"
                      className={styles.inputField}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      className={styles.primaryButton}
                      onClick={handleResetPassword}
                      disabled={isLoading || !newPassword || !confirmPassword}
                    >
                      {isLoading ? "Cambiando..." : "Cambiar contraseña"}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
