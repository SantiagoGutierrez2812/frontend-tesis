import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./InventarioDashboard.module.css";

import { login, verifyOtp, type LoginSuccessResponse } from "../services/authservice/authService";
import { getCompanyName } from "../services/companies/app_companies";
import type { Company, CompaniesResponse } from "../services/companies/app_companies";
import { getInventories } from "../services/inventory/app_inventario";
import type { Inventory, InventoriesResponse } from "../services/inventory/app_inventario";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRecovery, setIsRecovery] = useState(false);
    const [isVerificationStep, setIsVerificationStep] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [companies, setCompanies] = useState<Company[]>([]);
    const [inventories, setInventories] = useState<Inventory[]>([]);

    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 🧩 Cargar datos iniciales
    useEffect(() => {
        async function fetchData() {
            try {
                const [companiesData, inventoriesData]: [CompaniesResponse, InventoriesResponse] =
                    await Promise.all([getCompanyName(), getInventories()]);

                if (companiesData.ok && companiesData.companies)
                    setCompanies(companiesData.companies);
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

    // 🧠 Paso 1: Login y envío de OTP
    const handleLogin = async () => {
        setIsLoading(true);
        setError("");

        try {
            const data = await login(username, password);

            if (data.ok) {
                setIsVerificationStep(true);
                toast.info(`🔐 Te enviamos un código a tu correo. ${data.message}`);
            } else {
                setError(data.message || "Respuesta inesperada del servidor");
            }
        } catch (e: any) {
            setError(e.message || "Error al iniciar sesión");
            toast.error(`❌ ${e.message || "Error al iniciar sesión"}`);
        } finally {
            setIsLoading(false);
        }
    };

    // 🧩 Paso 2: Verificación OTP
    const handleVerifyCode = async () => {
        const trimmedCode = verificationCode.trim();
        if (trimmedCode.length < 4) {
            toast.error("❌ El código debe tener al menos 4 dígitos.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const result: LoginSuccessResponse = await verifyOtp(username, trimmedCode);

            if (result.ok && result.access_token) {
                toast.success("✅ Código verificado y sesión iniciada");
                setIsModalOpen(false);
                setIsVerificationStep(false);

                const role = localStorage.getItem("role");

                // 🔄 Redirección según rol
                if (role === "1") {
                    navigate("/dashboard");
                } else if (role === "2") {
                    navigate("/registro");
                } else {
                    navigate("/no-autorizado");
                }
            } else {
                toast.error("❌ Código inválido o error al verificar.");
            }
        } catch (e: any) {
            setError(e.message || "Error al verificar código");
            toast.error(`❌ ${e.message || "Error al verificar código"}`);
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
                    {companies.map((company) => {
                        const companyInventories = inventories.filter(
                            (inv) => inv.branch_id === company.id
                        );
                        return (
                            <div key={company.id} className={styles.card}>
                                <h2 className={styles.cardTitle}>{company.name}</h2>
                                <div className={styles.tableScroll}>
                                    <table className={styles.inventoryTable}>
                                        <thead>
                                            <tr>
                                                <th>Material</th>
                                                <th>Cantidad</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {companyInventories.length > 0 ? (
                                                companyInventories.map((inv, index) => (
                                                    <tr key={index}>
                                                        <td className={styles.text5}>{inv.product_name}</td>
                                                        <td className={styles.text5}>{inv.quantity}</td>
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
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.socialIcons}>
                    <FaFacebook className={styles.icon} />
                    <FaTwitter className={styles.icon} />
                    <FaInstagram className={styles.icon} />
                </div>
            </footer>

            {/* 🔐 Modal de Login / Verificación */}
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
                                    {error && <p style={{ color: "red" }}>{error}</p>}
                                    <button
                                        className={styles.closeButton}
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cerrar
                                    </button>
                                </>
                            )
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
