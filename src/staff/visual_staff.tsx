import { useState, useEffect } from "react";
import styles from "./RegisterForm.module.css";
import TopControl from "../TopControl/TopControl";
import {
  get_users,
  post_user,
  delete_user,
  update_user,
} from "../services/services/apiService";
import type { UserTransformed, NewUserPayload } from "../services/types/types"; 
import { toast, ToastContainer } from "react-toastify";

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

// MOCK DE SUCURSALES: Reemplazar si se carga desde la API
const branchOptions = [
    { id: 1, name: "Sucursal Central" },
    { id: 2, name: "Sucursal Norte" },
    { id: 3, name: "Sucursal Sur" },
];

export const VisualStaff = () => {
  const [records, setRecords] = useState<PersonalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<PersonalData>(initialForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  // Función para resetear el estado del modal y formulario
  const resetModalState = () => {
    setShowModal(false);
    setEditIndex(null);
    setFormData(initialForm);
    setShowEditConfirm(false);
  }

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        // NOTA: Se asume que get_users trae el rol y la sucursal.
        const data: UserTransformed[] = await get_users();

        const processed: PersonalData[] = data
          .filter(u => !u.deleted_at) 
          .map((u) => ({
            name: u.name,
            document_id: String(u.document_id),
            email: u.email,
            phone_number: String(u.phone_number),
            role: String(u.role),
            // Aseguramos que branch_id sea un string para el estado local y el select
            branch_id: String(u.branch_id ?? ""), 
            password: "",
            username: u.username || "",
          }));
        setRecords(processed);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Error cargando usuarios");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getErrorMessage = (error: any): string => {
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.message) {
      try {
        const errorObj = JSON.parse(error.message);
        return errorObj.error || errorObj.message || "Error en la operación.";
      } catch {
        return error.message;
      }
    }
    return "Error desconocido.";
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

    // Validación de campos obligatorios
    if (editIndex === null && !formData.password.trim()) {
      missingFieldDisplay = "Contraseña";
    } else if (formData.role === "0") {
      missingFieldDisplay = "Rol";
    } else if (!formData.branch_id || formData.branch_id === "") { // Sucursal sin seleccionar
        missingFieldDisplay = "Sucursal";
    } else {
      const missingKey = requiredFields.find((field) => !formData[field].trim());

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
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
      return;
    }

    // Validación de longitud y números
    if (formData.document_id.length > 10) {
      toast.error("El Documento no puede superar 10 caracteres.", { position: "top-right", autoClose: 5000, }); return;
    }
    if (formData.phone_number.length > 10) {
      toast.error("El Teléfono no puede superar 10 caracteres.", { position: "top-right", autoClose: 5000, }); return;
    }

    const docNum = Number(formData.document_id);
    const phoneNum = Number(formData.phone_number);

    if (isNaN(docNum) || isNaN(phoneNum)) {
      const field = isNaN(docNum) ? "Documento" : "Teléfono";
      toast.error(`${field} debe ser un número válido.`, { position: "top-right", autoClose: 5000, });
      return;
    }

    if (editIndex === null) {
      // Lógica para REGISTRO
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
        toast.success("✅ Usuario registrado correctamente.", { position: "top-right", autoClose: 5000, });
        setRecords([
          ...records,
          { ...formData, role: formData.role, branch_id: formData.branch_id },
        ]);
        resetModalState(); 
      } catch (err: any) {
        const errorMessage = getErrorMessage(err).toLowerCase();
        let displayMsg = "Ocurrió un error al registrar el usuario.";

        if (errorMessage.includes("email")) {
            displayMsg = "Este correo electrónico ya se encuentra en uso. Por favor, pruebe con otro.";
        } else if (errorMessage.includes("username")) {
            displayMsg = "El nombre de usuario ya está ocupado. Intenta con otro.";
        } else if (errorMessage.includes("document_id")) {
            displayMsg = "El número de documento ya pertenece a una cuenta activa.";
        } else if (errorMessage.includes("phone_number") || errorMessage.includes("phone")) {
            displayMsg = "Este número de teléfono ya está registrado. Por favor, verifique.";
        } else {
            // Error de la imagen subida (PyMySQL error)
            displayMsg = `Conflicto de datos: ${errorMessage}`;
        }
        
        toast.error(displayMsg, { position: "top-right", autoClose: 8000, }); // Aumentar autoClose para errores de BD
      }
    } else {
      setShowEditConfirm(true);
    }
  };

  const confirmEdit = async () => {
    if (editIndex === null) return;

    const payload: any = {};
    const original = records[editIndex];

    // Chequeo de cambios para el payload
    if (formData.name !== original.name) payload.name = formData.name;
    // document_id está deshabilitado, no se edita, solo se usa como clave
    if (formData.email !== original.email) payload.email = formData.email;
    if (formData.username !== original.username)
      payload.username = formData.username;

    if (formData.password) payload.hashed_password = formData.password;
    if (formData.phone_number !== original.phone_number)
      payload.phone_number = Number(formData.phone_number);

    // ✅ CORRECCIÓN: Checkear si el rol cambia y enviar role_id
    if (formData.role !== original.role) payload.role_id = Number(formData.role);

    // ✅ CORRECCIÓN: Checkear si la sucursal cambia y enviar branch_id
    if (formData.branch_id !== original.branch_id)
      payload.branch_id = Number(formData.branch_id);

    // Si no hay cambios, muestra toast y cierra el modal
    if (Object.keys(payload).length === 0) {
      toast.info("No se modificó ningún campo.", { 
        position: "top-right",
        autoClose: 3000, 
      });
      resetModalState(); 
      return;
    }

    try {
      // Usamos el document_id original como identificador para la API
      await update_user(original.document_id, payload);
      toast.success("Usuario actualizado correctamente", { position: "top-right", autoClose: 5000, });
      
      // ✅ CORRECCIÓN: Actualizar el estado local con los nuevos valores de formData
      const updated = [...records];
      updated[editIndex] = {
        ...updated[editIndex],
        ...formData, // Esto sobreescribe los campos con los nuevos valores del form
        password: "", // Limpiamos la contraseña
      };
      setRecords(updated);
      
      resetModalState();

    } catch (err: any) {
        const errorMessage = getErrorMessage(err).toLowerCase();
        let displayMsg = "Ocurrió un error al procesar la operación.";

        if (errorMessage.includes("email")) {
            displayMsg = "Este correo electrónico ya se encuentra en uso por otra persona.";
        } else if (errorMessage.includes("username")) {
            displayMsg = "El nombre de usuario ya está ocupado por otra persona.";
        } else if (errorMessage.includes("document_id")) {
            displayMsg = "El número de documento ya pertenece a otra cuenta activa.";
        } else if (errorMessage.includes("phone_number") || errorMessage.includes("phone")) {
            displayMsg = "Este número de teléfono ya está registrado. Por favor, verifique.";
        } else {
            displayMsg = `Conflicto de datos: ${errorMessage}`;
        }
        
        toast.error(displayMsg, { position: "top-right", autoClose: 8000, }); // Aumentar autoClose para errores de BD
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
    const index = deleteIndex;
    const userToDelete = records[index];
    setShowDeleteConfirm(false);
    setDeleteIndex(null);

    try {
      await delete_user(userToDelete.document_id);
      setRecords(records.filter((_, i) => i !== index)); 
      toast.success(
        `🗑️ Usuario ${userToDelete.name} inhabilitado correctamente.`,
        { position: "bottom-right", autoClose: 5000 } 
      );
    } catch (err: any) {
      toast.error("Ocurrió un error al inhabilitar el usuario.", {
        position: "bottom-right",
        autoClose: 5000,
      });
    }
  };

  const filteredRecords = records.filter(
    (rec) =>
      rec.name.toLowerCase().includes(search.toLowerCase()) ||
      rec.document_id.includes(search) ||
      rec.phone_number.includes(search) ||
      rec.username.toLowerCase().includes(search.toLowerCase())
  );

  const getBranchName = (branchId: string) => {
    const branch = branchOptions.find(b => String(b.id) === branchId);
    return branch ? branch.name : 'N/A';
  }

  return (
    <div className={styles.page}>
      {/* ⚠️ ÚNICA INSTANCIA: Si la tienes en App.tsx o Layout.tsx, elimínala de aquí */}
      <ToastContainer position="top-right" autoClose={5000} />
      <TopControl title="Panel de Administración" />
      <div className={styles.container}>
        <h2 className={styles.title}>Empleados Registrados</h2>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading && <p>Cargando...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && filteredRecords.length === 0 ? (
          <p className={styles.empty}>No se encontraron registros</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Sucursal</th>
                  <th>Usuario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec, i) => (
                  <tr key={i}>
                    <td>{rec.name}</td>
                    <td>{rec.document_id}</td>
                    <td>{rec.email}</td>
                    <td>{rec.phone_number}</td>
                    <td>{rec.role === '1' ? 'Admin' : 'Empleado'}</td>
                    <td>{getBranchName(rec.branch_id)}</td>
                    <td>{rec.username}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button
          className={styles.addBtn}
          onClick={() => {
            setFormData(initialForm);
            setEditIndex(null); 
            setShowModal(true);
          }}
        >
          ➕ Registrar Nuevo
        </button>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.title}>
              {editIndex !== null ? "Editar Usuario" : "Registrar Nuevo Usuario"}
            </h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                name="name"
                placeholder="Nombre"
                value={formData.name}
                onChange={handleChange}
              />
              <input
                type="number"
                name="document_id"
                placeholder="Documento"
                value={formData.document_id}
                onChange={handleChange}
                disabled={editIndex !== null}
              />
              <input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              <input
                type="number"
                name="phone_number"
                placeholder="Teléfono"
                value={formData.phone_number}
                onChange={handleChange}
              />
              <input
                name="username"
                placeholder="Usuario"
                value={formData.username}
                onChange={handleChange}
              />
              
              <select name="branch_id" value={formData.branch_id} onChange={handleChange}>
                <option value="" disabled>
                  Seleccionar Sucursal
                </option>
                {branchOptions.map(branch => (
                    <option key={branch.id} value={String(branch.id)}>
                        {branch.name}
                    </option>
                ))}
              </select>

              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="0" disabled>
                  Seleccionar Rol
                </option>
                <option value="1">Administrador</option>
                <option value="2">Empleado</option>
              </select>
              <input
                name="password"
                type="password"
                placeholder={
                  editIndex !== null
                    ? "Contraseña (solo si desea cambiarla)"
                    : "Contraseña"
                }
                value={formData.password}
                onChange={handleChange}
              />
              <div className={styles.actions}>
                <button className={styles.button} type="submit">
                  {editIndex !== null ? "Guardar" : "Registrar"}
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

      {showEditConfirm && editIndex !== null && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: "400px" }}>
            <h2 className={styles.title} style={{ color: "#f39c12" }}>
              Confirmar cambios
            </h2>
            <p
              style={{
                marginBottom: "25px",
                textAlign: "center",
                fontSize: "1.1em",
              }}
            >
              ¿Estás seguro de modificar los datos de{" "}
              <strong>{records[editIndex].name}</strong>?
            </p>
            <div
              className={styles.actions}
              style={{ justifyContent: "space-around", paddingTop: "10px" }}
            >
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowEditConfirm(false)} 
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.button}
                style={{ backgroundColor: "#f39c12" }}
                onClick={confirmEdit}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && deleteIndex !== null && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: "400px" }}>
            <h2 className={styles.title} style={{ color: "#e74c3c" }}>
              Confirmar Inhabilitación
            </h2>
            <p
              style={{
                marginBottom: "25px",
                textAlign: "center",
                fontSize: "1.1em",
              }}
            >
              ¿Estás seguro de que deseas **inhabilitar** a{" "}
              <strong>{records[deleteIndex]?.name}</strong>? Podrá ser
              reactivado más tarde.
            </p>
            <div
              className={styles.actions}
              style={{ justifyContent: "space-around", paddingTop: "10px" }}
            >
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteIndex(null);
                }}
              >
                Cerrar
              </button>
              <button
                type="button"
                className={styles.button}
                style={{ backgroundColor: "#e74c3c" }}
                onClick={executeDelete}
              >
                Inhabilitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};