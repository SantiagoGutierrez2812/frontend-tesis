import { useState, useEffect } from "react";
import styles from "./RegisterForm.module.css";
import TopControl from "../TopControl/TopControl";
import { get_users, type UserTransformed } from "../services/services/apiService";

interface PersonalData extends UserTransformed {
  direccion: string; fechaIngreso: string; password: string;
}


const Personal = () => {
  const [records, setRecords] = useState<PersonalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<PersonalData>({
    name: "",
    document_id: "",
    email: "",
    phone_number: "",
    cargo: "",
    role: "2",
    direccion: "",
    fechaIngreso: "",
    password: "",
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data: UserTransformed[] = await get_users();

        const processedData: PersonalData[] = data.map(user => ({
          ...user,
          direccion: 'N/A',
          fechaIngreso: 'N/A',
          password: '',
        }));

        setRecords(processedData);
        setError(null);
      } catch (err: any) {
        setError(err.message || "No se pudieron cargar los empleados.");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editIndex !== null) {
      const updated = [...records];
      updated[editIndex] = formData;
      setRecords(updated);
      setEditIndex(null);
    } else {
      setRecords([...records, formData]);
    }

    setFormData({
      name: "", document_id: "", email: "", phone_number: "", cargo: "", role: "2",
      direccion: "", fechaIngreso: "", password: "",
    });
    setShowModal(false);
  };

  const handleDelete = (index: number) => {
    setRecords(records.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number) => {
    setFormData(records[index]);
    setEditIndex(index);
    setShowModal(true);
  };

  return (
    <div className={styles.page}>
      <TopControl title="🚀 Panel de Administración" />
      <div className={styles.container}>
        <h2 className={styles.title}>👥 Empleados Registrados</h2>

        {loading && <p className={styles.empty}>Cargando registros de la base de datos...</p>}
        {error && <p className={styles.empty} style={{ color: 'red' }}>⚠️ Error: {error}</p>}

        {!loading && !error && records.length === 0 ? (
          <p className={styles.empty}>No hay registros aún.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, i) => (
                <tr key={i}>
                  <td>{rec.name}</td>
                  <td>{rec.document_id}</td>
                  <td>{rec.email}</td>
                  <td>{rec.phone_number}</td>
                  <td>{rec.role}</td>
                  <td>
                    <button className={styles.editBtn} onClick={() => handleEdit(i)}>✏️</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(i)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button onClick={() => setShowModal(true)} className={styles.addBtn}>
          ➕ Registrar Nuevo
        </button>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>{editIndex !== null ? "Editar Empleado" : "Registrar Nuevo"}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input type="text" name="name" placeholder="Nombre completo" value={formData.name} onChange={handleChange} />
              <input type="text" name="document_id" placeholder="Documento de identidad" value={formData.document_id} onChange={handleChange} />
              <input type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} />
              <input type="tel" name="phone_number" placeholder="Teléfono" value={formData.phone_number} onChange={handleChange} />
              <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} />

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={styles.selectField}
              >
                <option value="" disabled>Seleccionar Rol</option>
                <option value="1">Administrador</option>
                <option value="2">Empleado</option>
              </select>

              <input type="date" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange} />
              <input type="password" name="password" placeholder="Contraseña de acceso" value={formData.password} onChange={handleChange} />

              <div className={styles.actions}>
                <button type="submit" className={styles.button}>
                  {editIndex !== null ? "Guardar Cambios" : "Registrar"}
                </button>
                <button type="button" className={styles.closeBtn} onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personal;