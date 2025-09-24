import { useState } from "react";
import styles from "./RegisterForm.module.css";

interface PersonalData {
  nombre: string;
  documento: string;
  correo: string;
  telefono: string;
  direccion: string;
  cargo: string;
  fechaIngreso: string;
  password: string;
}

const Personal = () => {
  const [records, setRecords] = useState<PersonalData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<PersonalData>({
    nombre: "",
    documento: "",
    correo: "",
    telefono: "",
    direccion: "",
    cargo: "",
    fechaIngreso: "",
    password: "",
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editIndex !== null) {
      // editar
      const updated = [...records];
      updated[editIndex] = formData;
      setRecords(updated);
      setEditIndex(null);
    } else {
      // nuevo
      setRecords([...records, formData]);
    }

    // reset
    setFormData({
      nombre: "",
      documento: "",
      correo: "",
      telefono: "",
      direccion: "",
      cargo: "",
      fechaIngreso: "",
      password: "",
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
      <div className={styles.container}>
        <h2 className={styles.title}>👥 Empleados Registrados</h2>
        {records.length === 0 ? (
          <p className={styles.empty}>No hay registros aún.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Correo</th>
                <th>Cargo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, i) => (
                <tr key={i}>
                  <td>{rec.nombre}</td>
                  <td>{rec.documento}</td>
                  <td>{rec.correo}</td>
                  <td>{rec.cargo}</td>
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
        )}

        <button onClick={() => setShowModal(true)} className={styles.addBtn}>
          ➕ Registrar Nuevo
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>{editIndex !== null ? "Editar Empleado" : "Registrar Nuevo"}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleChange}
              />
              <input
                type="text"
                name="documento"
                placeholder="Documento de identidad"
                value={formData.documento}
                onChange={handleChange}
              />
              <input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                value={formData.correo}
                onChange={handleChange}
              />
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
              />
              <input
                type="text"
                name="direccion"
                placeholder="Dirección"
                value={formData.direccion}
                onChange={handleChange}
              />
              <input
                type="text"
                name="cargo"
                placeholder="Cargo / Puesto"
                value={formData.cargo}
                onChange={handleChange}
              />
              <input
                type="date"
                name="fechaIngreso"
                value={formData.fechaIngreso}
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Contraseña de acceso"
                value={formData.password}
                onChange={handleChange}
              />
              <div className={styles.actions}>
                <button type="submit" className={styles.button}>
                  {editIndex !== null ? "Guardar Cambios" : "Registrar"}
                </button>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setShowModal(false)}
                >
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
