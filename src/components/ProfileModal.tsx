// src/components/ProfileModal.tsx
import React, { useEffect, useState } from "react";
import styles from "../pages/Dashboard.module.css";
import { getCurrentUser } from "../services/user/user_service";
import type { UserTransformed } from "../services/types/user/user";
import { toast } from "react-toastify";

interface ProfileModalProps {
  show: boolean;
  onClose: () => void;
}

export default function ProfileModal({ show, onClose }: ProfileModalProps) {
  const [userData, setUserData] = useState<UserTransformed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const user = await getCurrentUser();
          setUserData(user);
        } catch {
          toast.error("Error al obtener los datos del perfil");
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Mi Perfil</h2>

        {loading ? (
          <p className={styles.loadingText}>Cargando información...</p>
        ) : userData ? (
          <form>
            <label>Nombre Completo</label>
            <input type="text" value={userData.name} readOnly />

            <label>Nombre de Usuario</label>
            <input type="text" value={userData.username} readOnly />

            <label>Correo Electrónico</label>
            <input type="email" value={userData.email} readOnly />

            <label>Documento de Identidad</label>
            <input type="text" value={userData.document_id} readOnly />

            <label>Teléfono</label>
            <input type="text" value={userData.phone_number} readOnly />

            <label>Rol</label>
            <input type="text" value={userData.role} readOnly />

            {userData.branch_name && (
              <>
                <label>Sucursal</label>
                <input type="text" value={userData.branch_name} readOnly />
              </>
            )}

            {userData.cargo && (
              <>
                <label>Cargo</label>
                <input type="text" value={userData.cargo} readOnly />
              </>
            )}

            <div className={styles.modalButtons}>
              <button type="button" className={styles.btnCancel} onClick={onClose}>
                Cerrar
              </button>
            </div>
          </form>
        ) : (
          <p className={styles.errorText}>No se encontraron datos del usuario.</p>
        )}
      </div>
    </div>
  );
}
