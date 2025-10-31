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
    type LoginSuccessResponse
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

    // 🧩 Cargar datos iniciales
    useEffect(() => {
        async function fetchData() {
            try {
                const [branchesData, inventoriesData] = await Promise.all([
                    getBranches(),
                    getInventories()
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

    // 🪶 Fondo de partículas
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
                toast.info(`Te enviamos un codigo a tu correo. ${data.message}`);
            } else {
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                const errorMsg = e.message || "Error al iniciar sesion";

                // Verificar si es un mensaje de bloqueo por rate limit
                if (errorMsg.includes("bloqueada") || errorMsg.includes("bloqueado")) {
                    // Extraer tiempo si está presente en el mensaje
                    const timeMatch = errorMsg.match(/(\d+)\s*minutos?/);
                    if (timeMatch) {
                        toast.error(`Cuenta bloqueada. Debe esperar ${timeMatch[1]} minutos antes de intentar nuevamente.`, {
                            autoClose: 8000
                        });
                    } else {
                        toast.error(errorMsg, { autoClose: 8000 });
                    }
                } else if (errorMsg.includes("Demasiados intentos")) {
                    toast.error(errorMsg, { autoClose: 8000 });
                } else if (errorMsg.includes("Le quedan")) {
                    // Extraer intentos restantes
                    const attemptsMatch = errorMsg.match(/Le quedan (\d+) intentos?/);
                    if (attemptsMatch) {
                        toast.error(errorMsg);
                        toast.warning(`Atencion: solo le quedan ${attemptsMatch[1]} intentos antes de ser bloqueado por 30 minutos.`, {
                            autoClose: 6000
                        });
                    } else {
                        toast.error(errorMsg);
                    }
                } else {
                    toast.error(errorMsg);
                    toast.warning("Recuerde: tiene un maximo de 5 intentos antes de ser bloqueado por 30 minutos.", {
                        autoClose: 5000
                    });
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    // OTP Login
    const handleVerifyCode = async () => {
        const trimmedCode = verificationCode.trim();
        if (trimmedCode.length < 4) {
            toast.error("El codigo debe tener al menos 4 digitos.");
            return;
        }
        setIsLoading(true);

        try {
            const result: LoginSuccessResponse = await verifyOtp(username, trimmedCode);
            if (result.ok && result) {
                toast.success("Codigo verificado y sesion iniciada");
                setIsModalOpen(false);
                setIsVerificationStep(false);

                const role = localStorage.getItem("role");
                if (role === "1") navigate("/dashboard");
                else if (role === "2") navigate("/registro");
                else navigate("/no-autorizado");
            } else {
                toast.error("Codigo invalido o error al verificar.");
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                const errorMsg = e.message || "Error al verificar codigo";

                // Verificar si es un mensaje de bloqueo por rate limit
                if (errorMsg.includes("bloqueada") || errorMsg.includes("bloqueado")) {
                    const timeMatch = errorMsg.match(/(\d+)\s*minutos?/);
                    if (timeMatch) {
                        toast.error(`Cuenta bloqueada. Debe esperar ${timeMatch[1]} minutos antes de intentar nuevamente.`, {
                            autoClose: 8000
                        });
                    } else {
                        toast.error(errorMsg, { autoClose: 8000 });
                    }
                } else if (errorMsg.includes("Demasiados intentos")) {
                    toast.error(errorMsg, { autoClose: 8000 });
                } else if (errorMsg.includes("Le quedan")) {
                    // Extraer intentos restantes
                    const attemptsMatch = errorMsg.match(/Le quedan (\d+) intentos?/);
                    if (attemptsMatch) {
                        toast.error(errorMsg);
                        toast.warning(`Atencion: solo le quedan ${attemptsMatch[1]} intentos antes de ser bloqueado por 15 minutos.`, {
                            autoClose: 6000
                        });
                    } else {
                        toast.error(errorMsg);
                    }
                } else {
                    toast.error(errorMsg);
                    toast.warning("Recuerde: tiene un maximo de 3 intentos antes de ser bloqueado por 15 minutos.", {
                        autoClose: 5000
                    });
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 🔹 Recuperación de contraseña
    const handleSendRecoveryEmail = async () => {
        if (!recoveryEmail) {
            toast.error("❌ Ingresa un correo válido.");
            return;
        }
        setIsLoading(true);
        try {
            const res = await forgotPassword(recoveryEmail);
            toast.info(res.message);
            setIsOtpStep(true); // paso OTP
        } catch (e: unknown) {
            if (e instanceof Error) {
                toast.error(e.message || "Error enviando correo de recuperación.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtpRecovery = async () => {
        if (!otpCode || otpCode.length < 4) {
            toast.error("Ingresa un codigo valido.");
            return;
        }
        setIsLoading(true);
        try {
            const res = await verifyOtpPassword(recoveryEmail, otpCode);
            if (res.ok) {
                toast.success(res.message);
                setIsOtpStep(false);
                setIsResetStep(true);
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                const errorMsg = e.message || "Error verificando codigo OTP.";

                // Verificar si es un mensaje de bloqueo por rate limit
                if (errorMsg.includes("bloqueada") || errorMsg.includes("bloqueado")) {
                    const timeMatch = errorMsg.match(/(\d+)\s*minutos?/);
                    if (timeMatch) {
                        toast.error(`Cuenta bloqueada. Debe esperar ${timeMatch[1]} minutos antes de intentar nuevamente.`, {
                            autoClose: 8000
                        });
                    } else {
                        toast.error(errorMsg, { autoClose: 8000 });
                    }
                } else if (errorMsg.includes("Demasiados intentos")) {
                    toast.error(errorMsg, { autoClose: 8000 });
                } else if (errorMsg.includes("Le quedan")) {
                    const attemptsMatch = errorMsg.match(/Le quedan (\d+) intentos?/);
                    if (attemptsMatch) {
                        toast.error(errorMsg);
                        toast.warning(`Atencion: solo le quedan ${attemptsMatch[1]} intentos antes de ser bloqueado por 15 minutos.`, {
                            autoClose: 6000
                        });
                    } else {
                        toast.error(errorMsg);
                    }
                } else {
                    toast.error(errorMsg);
                    toast.warning("Recuerde: tiene un maximo de 3 intentos antes de ser bloqueado por 15 minutos.", {
                        autoClose: 5000
                    });
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error("❌ La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("❌ Las contraseñas no coinciden.");
            return;
        }
        setIsLoading(true);
        try {
            const res = await resetPassword(recoveryEmail, otpCode, newPassword, confirmPassword);
            if (res.ok) {
                toast.success(res.message);
                setIsResetStep(false);
                setIsRecovery(false);
                setIsModalOpen(false);
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                toast.error(e.message || "Error al cambiar la contraseña.");
            }
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

            {/* Main Content */}
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
                                        <tbody >
                                            {branchInventories.length > 0 ? (
                                                branchInventories.map((inv, index) => (
                                                    <tr key={index}>
                                                        <td className={styles.text5}>{inv.product_name}</td>
                                                        <td className={styles.text5}>{inv.quantity}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={2} className={styles.text5}>Sin inventario</td>
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

            {/* Footer */}
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

            {/* Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        {/* Login / OTP */}
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
                                        Por favor, revisa tu correo e ingresa el código recibido para{" "}
                                        <b>{username}</b>:
                                    </p>
                                    <input
                                        type="text"
                                        placeholder="Código de verificación"
                                        className={styles.inputField}
                                        maxLength={6}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={verificationCode}
                                        onChange={(e) =>
                                            setVerificationCode(e.target.value.replace(/\D/g, ""))
                                        }
                                    />
                                    <button
                                        className={styles.primaryButton}
                                        onClick={handleVerifyCode}
                                        disabled={isLoading || verificationCode.length < 4}
                                    >
                                        {isLoading ? "Verificando..." : "Verificar código"}
                                    </button>
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
                                {/* Recuperación de contraseña */}
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
                                            {isLoading ? "Enviando..." : "Enviar enlace"}
                                        </button>
                                        <button
                                            className={styles.linkButton}
                                            onClick={() => setIsRecovery(false)}
                                        >
                                            Volver al login
                                        </button>
                                        <button
                                            className={styles.closeButton}
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                setIsRecovery(false);
                                                setRecoveryEmail("");
                                            }}
                                        >
                                            Cerrar
                                        </button>
                                    </>
                                )}

                                {isOtpStep && !isResetStep && (
                                    <>
                                        <h2>Verificación de Código</h2>
                                        <p>Revisa tu correo <b>{recoveryEmail}</b> e ingresa el código recibido:</p>
                                        <input
                                            type="text"
                                            placeholder="Código OTP"
                                            className={styles.inputField}
                                            value={otpCode}
                                            maxLength={6}
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                        />
                                        <button
                                            className={styles.primaryButton}
                                            onClick={handleVerifyOtpRecovery}
                                            disabled={isLoading || otpCode.length < 4}
                                        >
                                            {isLoading ? "Verificando..." : "Verificar código"}
                                        </button>
                                        <button
                                            className={styles.closeButton}
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                setIsRecovery(false);
                                                setIsOtpStep(false);
                                                setRecoveryEmail("");
                                                setOtpCode("");
                                            }}
                                        >
                                            Cerrar
                                        </button>
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
                                        <button
                                            className={styles.closeButton}
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                setIsRecovery(false);
                                                setIsOtpStep(false);
                                                setIsResetStep(false);
                                                setRecoveryEmail("");
                                                setOtpCode("");
                                                setNewPassword("");
                                                setConfirmPassword("");
                                            }}
                                        >
                                            Cerrar
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
