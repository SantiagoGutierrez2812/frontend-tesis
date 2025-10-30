import { useState, useEffect } from "react";
import styles from "./RegisterForm.module.css";
import TopControl from "../TopControl/TopControl";
import {
    get_users,
    post_user,
    delete_user,
    update_user,
} from "../services/services/apiService";
import type {
    UserTransformed,
    NewUserPayload,
} from "../services/types/user/user";
import { getBranches } from "../services/branchService/branchService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface RoleOption {
    id: number;
    name: string;
}

interface BranchOption {
    id: number;
    name: string;
}

interface PersonalData {
    name: string;
    document_id: string;
    email: string;
    phone_number: string;
    role: string;
    branch_id: string;
    password: string;
    username: string;
}

const initialForm: PersonalData = {
    name: "",
    document_id: "",
    email: "",
    phone_number: "",
    role: "0",
    branch_id: "",
    password: "",
    username: "",
};

export const VisualStaff = () => {
    const [records, setRecords] = useState<PersonalData[]>([]);
    const [_loading, setLoading] = useState(true);
    const [_error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filterBranchId] = useState<string>("all");
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<PersonalData>(initialForm);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [showEditConfirm, setShowEditConfirm] = useState(false);

    const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
    const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);

    const resetModalState = () => {
        setShowModal(false);
        setEditIndex(null);
        setFormData(initialForm);
        setShowEditConfirm(false);
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const MOCKED_ROLES: RoleOption[] = [
                    { id: 1, name: "Administrador" },
                    { id: 2, name: "Empleado" },
                ];
                const [roles, branches, usersData] = await Promise.all([
                    Promise.resolve(MOCKED_ROLES),
                    getBranches(),
                    get_users(),
                ]);

                setRoleOptions(roles);
                setBranchOptions(branches);

                const processed: PersonalData[] = usersData
                    .filter((u: UserTransformed) => !u.deleted_at)
                    .map((u: UserTransformed) => ({
                        name: u.name,
                        document_id: String(u.document_id),
                        email: u.email,
                        phone_number: String(u.phone_number),
                        role: String(u.role),
                        branch_id: String(u.branch_id ?? ""),
                        password: "",
                        username: u.username || "",
                    }));

                setRecords(processed);
                setError(null);
            } catch (err: any) {
                setError(
                    err.message ||
                        "Error cargando datos esenciales (usuarios, roles o sucursales)."
                );
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getErrorMessage = (error: any): string => {
        if (error?.response?.data?.error) return error.response.data.error;
        if (typeof error?.response?.data === "string") return error.response.data;
        if (error?.message) return error.message;
        return "Error desconocido en la operación.";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const requiredFields: Array<keyof PersonalData> = [
            "name",
            "email",
            "document_id",
            "phone_number",
            "username",
        ];

        let missingFieldDisplay: string | undefined;

        if (editIndex === null && !formData.password.trim()) {
            missingFieldDisplay = "Contraseña";
        } else if (formData.role === "0") {
            missingFieldDisplay = "Rol";
        } else if (!formData.branch_id || formData.branch_id === "") {
            missingFieldDisplay = "Sucursal";
        } else {
            const missingKey = requiredFields.find(
                (field) => !formData[field].trim()
            );
            if (missingKey) {
                const fieldNameMap: Record<keyof PersonalData, string> = {
                    name: "Nombre",
                    document_id: "Documento",
                    email: "Email",
                    phone_number: "Teléfono",
                    username: "Usuario",
                    branch_id: "Sucursal",
                    role: "Rol",
                    password: "Contraseña",
                };
                missingFieldDisplay = fieldNameMap[missingKey];
            }
        }

        if (missingFieldDisplay) {
            toast.error(
                `Por favor, complete el campo obligatorio: ${missingFieldDisplay}.`,
                { position: "top-right", autoClose: 5000 }
            );
            return;
        }

        // 🔒 VALIDACIONES PERSONALIZADAS
        if (formData.password && formData.password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres.", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        if (
            formData.document_id.length !== 10 ||
            !/^\d+$/.test(formData.document_id)
        ) {
            toast.error("El Documento debe tener exactamente 10 dígitos numéricos.", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        if (
            formData.phone_number.length !== 10 ||
            !/^\d+$/.test(formData.phone_number)
        ) {
            toast.error("El Teléfono debe tener exactamente 10 dígitos numéricos.", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        const docNum = Number(formData.document_id);
        const phoneNum = Number(formData.phone_number);

        if (editIndex === null) {
            const payload: NewUserPayload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                username: formData.username.trim(),
                hashed_password: String(formData.password).trim(),
                document_id: docNum,
                phone_number: phoneNum,
                role_id: Number(formData.role),
                branch_id: Number(formData.branch_id),
            };

            try {
                await post_user(payload);
                toast.success("✅ Usuario registrado correctamente.");
                setRecords([
                    ...records,
                    {
                        ...formData,
                        role: formData.role,
                        branch_id: formData.branch_id,
                    },
                ]);
                resetModalState();
            } catch (err: any) {
                const backendMessage = getErrorMessage(err);
                toast.error(backendMessage, {
                    position: "top-right",
                    autoClose: 8000,
                });
            }
        } else {
            setShowEditConfirm(true);
        }
    };

    const confirmEdit = async () => {
        if (editIndex === null) return;

        const payload: any = {};
        const original = records[editIndex];

        if (formData.password && formData.password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres.", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        if (
            formData.document_id.length !== 10 ||
            !/^\d+$/.test(formData.document_id)
        ) {
            toast.error("El Documento debe tener exactamente 10 dígitos numéricos.", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        if (
            formData.phone_number.length !== 10 ||
            !/^\d+$/.test(formData.phone_number)
        ) {
            toast.error("El Teléfono debe tener exactamente 10 dígitos numéricos.", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        if (formData.name !== original.name) payload.name = formData.name;
        if (formData.email !== original.email) payload.email = formData.email;
        if (formData.username !== original.username)
            payload.username = formData.username;
        if (formData.password) payload.hashed_password = formData.password;
        if (formData.phone_number !== original.phone_number)
            payload.phone_number = Number(formData.phone_number);
        if (formData.role !== original.role)
            payload.role_id = Number(formData.role);
        if (formData.branch_id !== original.branch_id)
            payload.branch_id = Number(formData.branch_id);

        if (Object.keys(payload).length === 0) {
            toast.info("No se modificó ningún campo.");
            resetModalState();
            return;
        }

        try {
            await update_user(original.document_id, payload);
            toast.success("Usuario actualizado correctamente");
            const updated = [...records];
            updated[editIndex] = {
                ...updated[editIndex],
                ...formData,
                password: "",
            };
            setRecords(updated);
            resetModalState();
        } catch (err: any) {
            const backendMessage = getErrorMessage(err);
            toast.error(backendMessage);
            setShowEditConfirm(false);
        }
    };

    const handleEdit = (index: number) => {
        const user = records[index];
        setFormData({
            name: user.name,
            document_id: user.document_id,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role,
            branch_id: user.branch_id,
            password: "",
            username: user.username,
        });
        setEditIndex(index);
        setShowModal(true);
    };

    const handleDelete = (index: number) => {
        setDeleteIndex(index);
        setShowDeleteConfirm(true);
    };

    const executeDelete = async () => {
        if (deleteIndex === null) return;
        const userToDelete = records[deleteIndex];
        setShowDeleteConfirm(false);
        setDeleteIndex(null);

        try {
            await delete_user(userToDelete.document_id);
            setRecords(records.filter((_, i) => i !== deleteIndex));
            toast.success(`🗑️ Usuario ${userToDelete.name} inhabilitado.`);
        } catch (err: any) {
            const backendMessage = getErrorMessage(err);
            toast.error(backendMessage);
        }
    };

    const getBranchName = (branchId: string | number): string => {
        const branch = branchOptions.find(
            (b) => String(b.id) === String(branchId)
        );
        return branch ? branch.name : `ID: ${branchId}`;
    };

    const getRoleName = (roleId: string): string => {
        const role = roleOptions.find((r) => String(r.id) === String(roleId));
        return role ? role.name : `ID: ${roleId}`;
    };

    const filteredRecords = records.filter((rec) => {
        const branchMatch =
            filterBranchId === "all" || rec.branch_id === filterBranchId;
        const searchMatch =
            rec.name.toLowerCase().includes(search.toLowerCase()) ||
            rec.document_id.includes(search) ||
            rec.phone_number.includes(search) ||
            rec.username.toLowerCase().includes(search.toLowerCase());
        return branchMatch && searchMatch;
    });

    return (
        <div className={styles.page}>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover={true} draggable theme="colored" />
            <TopControl title="Panel de Administración" />

            <div className={styles.container}>
                <h2 className={styles.title}>Gestión de Personal</h2>

                <div className={styles.filterContainer}>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Documento</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Sucursal</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className={styles.empty}>
                                        No hay registros disponibles.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((rec, i) => (
                                    <tr key={i}>
                                        <td>{rec.name}</td>
                                        <td>{rec.document_id}</td>
                                        <td>{rec.email}</td>
                                        <td>{rec.phone_number}</td>
                                        <td>{rec.username}</td>
                                        <td>{getRoleName(rec.role)}</td>
                                        <td>{getBranchName(rec.branch_id)}</td>
                                        <td>
                                            <button
                                                className={styles.editBtn}
                                                onClick={() => handleEdit(i)}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(i)}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <button
                    className={styles.addBtn}
                    onClick={() => setShowModal(true)}
                >
                    + Registrar Usuario
                </button>
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nombre"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                name="document_id"
                                placeholder="Documento"
                                value={formData.document_id}
                                onChange={handleChange}
                                maxLength={10}
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                name="phone_number"
                                placeholder="Teléfono"
                                value={formData.phone_number}
                                onChange={handleChange}
                                maxLength={10}
                            />
                            <input
                                type="text"
                                name="username"
                                placeholder="Usuario"
                                value={formData.username}
                                onChange={handleChange}
                            />
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="0">Seleccionar rol</option>
                                {roleOptions.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                name="branch_id"
                                value={formData.branch_id}
                                onChange={handleChange}
                            >
                                <option value="">Seleccionar sucursal</option>
                                {branchOptions.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="password"
                                name="password"
                                placeholder={
                                    editIndex !== null
                                        ? "Nueva Contraseña (opcional)"
                                        : "Contraseña"
                                }
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <div className={styles.actions}>
                                <button type="submit" className={styles.button}>
                                    {editIndex !== null
                                        ? "Guardar Cambios"
                                        : "Registrar"}
                                </button>
                                <button
                                    type="button"
                                    className={styles.closeBtn}
                                    onClick={resetModalState}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditConfirm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <p>¿Desea confirmar los cambios realizados?</p>
                        <div className={styles.actions}>
                            <button
                                className={styles.button}
                                onClick={confirmEdit}
                            >
                                Sí
                            </button>
                            <button
                                className={styles.closeBtn}
                                onClick={resetModalState}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <p>¿Seguro que desea inhabilitar este usuario?</p>
                        <div className={styles.actions}>
                            <button
                                className={styles.button}
                                onClick={executeDelete}
                            >
                                Sí
                            </button>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisualStaff;
