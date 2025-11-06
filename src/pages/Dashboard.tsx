import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import PowerWidget from '../widget/stores/PowerWidget';
import ThermostatWidget from '../widget/personnel_record/ThermostatWidget';
import HumidityWidget from '../widget/rank/HumidityWidget';
import styles from './Dashboard.module.css';
import ConfiWidget from '../widget/conf/confi';
import Loader from '../widget/supplier/supplier';
import MaterialWidget from '../widget/material/material';
import { getCurrentUser, updateUser } from '../services/user/user_service';
import { getBranches } from '../services/branchService/branchService';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import type { UserTransformed } from '../services/types/user/user';
import type { Branch } from '../services/types/branch/branchService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
    const [userName, setUserName] = useState<string>("Usuario");
    const [showModal, setShowModal] = useState(false);
    const [userData, setUserData] = useState<UserTransformed | null>(null);
    const [editedData, setEditedData] = useState<UserTransformed | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getCurrentUser();
                setUserData(user);
                setUserName(user.name);
            } catch {
                toast.error("Error al obtener datos del usuario");
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const handleOpenModal = async () => {
        setShowModal(true);
        setLoading(true);
        try {
            const [user, branchesData] = await Promise.all([
                getCurrentUser(),
                getBranches()
            ]);
            setUserData(user);
            setEditedData(user);
            setBranches(branchesData);
        } catch {
            toast.error("Error al cargar la información del usuario");
            setShowModal(false);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (editedData) {
            setEditedData({ ...editedData, [name]: value });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editedData || !userData) return;
        if (newPassword) {
            if (newPassword.length < 6) {
                toast.error("La contraseña debe tener al menos 6 caracteres");
                return;
            }
            if (newPassword !== confirmPassword) {
                toast.error("Las contraseñas no coinciden");
                return;
            }
        }
        setLoading(true);
        try {
            const updatedUser = await updateUser(
                editedData.document_id,
                {
                    name: editedData.name,
                    email: editedData.email,
                    document_id: editedData.document_id,
                    phone_number: editedData.phone_number,
                    username: editedData.username,
                    branch_id: editedData.branch_id,
                },
                newPassword || undefined
            );
            const refreshed = await getCurrentUser();
            setUserData(refreshed);
            setUserName(refreshed.name.trim());

            // Actualizar localStorage si el usuario editado es el usuario actualmente logueado
            const currentUserId = localStorage.getItem("user_id");
            if (currentUserId && String(updatedUser.id) === currentUserId) {
                if (updatedUser.branch_id) {
                    localStorage.setItem("branch_id", String(updatedUser.branch_id));
                    // Despachar evento personalizado para notificar a otros componentes
                    window.dispatchEvent(new Event("branchChanged"));
                }
            }

            toast.success("Información actualizada correctamente");
            setShowModal(false);
            setNewPassword("");
            setConfirmPassword("");
        } catch {
            toast.error("Error al actualizar la información");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        try {
            const response = await fetchWithAuth("/product-transactions/report/excel", {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Error al descargar el reporte');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte_transacciones_productos.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Reporte descargado correctamente");
        } catch {
            toast.error("Error al descargar el reporte");
        }
    };

    return (
        <div className={styles.backgroundWrapper}>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className={styles.backgroundBlur}></div>
            <div className={styles.dashboardContent}>
                <div className={styles.dashboardBox}>
                    <div className={styles.logoContainer}>
                        <h1 className={styles.logo} aria-label="Improexprees Logo"></h1>
                    </div>
                    <div className={styles.widgetContainer}>
                        <div className={styles.widgetBox}><PowerWidget /></div>
                        <div className={styles.widgetBox}><ThermostatWidget /></div>
                        <div className={styles.widgetBox}><HumidityWidget /></div>
                        <div className={styles.widgetBox}><ConfiWidget /></div>
                        <div className={styles.widgetBox}><Loader /></div>
                        <div className={styles.widgetBox}><MaterialWidget /></div>
                    </div>
                </div>
                <div className={styles.dashboardMenuBox}>
                    <div className={styles.menuItem} onClick={handleOpenModal} role="button" tabIndex={0}>
                        <span className={styles.menuIcon}>👤</span>
                        <span className={styles.menuText}>{userName}</span>
                    </div>
                    <div className={styles.menuItem} onClick={handleDownloadReport} role="button" tabIndex={0}>
                        <span className={styles.menuIcon}>📊</span>
                        <span className={styles.menuText}>Reporte </span>
                    </div>
                    <div className={styles.menuItem} onClick={handleLogout} role="button" tabIndex={0}>
                        <span className={styles.menuIcon}>🚪</span>
                        <span className={styles.menuText}>Cerrar sesión</span>
                    </div>
                </div>
            </div>
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Mi Perfil</h2>
                        {loading ? (
                            <div className={styles.loadingText}>Cargando...</div>
                        ) : (
                            <form onSubmit={handleSave}>
                                <label>Nombre Completo</label>
                                <input type="text" name="name" value={editedData?.name || ""} onChange={handleInputChange} required />
                                <label>Nombre de Usuario</label>
                                <input type="text" name="username" value={editedData?.username || ""} onChange={handleInputChange} required />
                                <label>Correo Electrónico</label>
                                <input type="email" name="email" value={editedData?.email || ""} onChange={handleInputChange} required />
                                <label>Documento de Identidad</label>
                                <input type="text" readOnly name="document_id" value={editedData?.document_id || ""} onChange={handleInputChange} required />
                                <label>Nueva Contraseña (opcional)</label>
                                <input type="password" name="new_password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Dejar en blanco para no cambiar" autoComplete="new-password" />
                                <label>Confirmar Nueva Contraseña</label>
                                <input type="password" name="confirm_password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar nueva contraseña" disabled={!newPassword} autoComplete="new-password" />
                                <label>Teléfono</label>
                                <input type="text" name="phone_number" value={editedData?.phone_number || ""} onChange={handleInputChange} required />
                                <label>Rol</label>
                                <input type="text" name="role" value={editedData?.role || ""} readOnly style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }} />
                                <label>Sucursal</label>
                                <select name="branch_id" value={editedData?.branch_id || ""} onChange={handleInputChange} required>
                                    <option value="">Seleccione una sucursal</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                                    ))}
                                </select>
                                <div className={styles.modalButtons}>
                                    <button type="submit" className={styles.btnSave} disabled={loading}>
                                        {loading ? "Guardando..." : "Guardar Cambios"}
                                    </button>
                                    <button type="button" className={styles.btnCancel} onClick={() => {
                                        setShowModal(false);
                                        setNewPassword("");
                                        setConfirmPassword("");
                                    }}>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
