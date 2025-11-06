import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getCurrentUser, updateUser } from "../../services/user/user_service";
import type { UserTransformed } from "../../services/types/user/user";
import { getBranches } from "../../services/branchService/branchService";
import type { Branch } from "../../services/types/branch/branchService";
import "./ProfileModal.css";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [userData, setUserData] = useState<UserTransformed | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const userRole = localStorage.getItem("role");
  const isAdmin = userRole === "1";
  const isEmployee = userRole === "2";

  useEffect(() => {
    if (isOpen) {
      loadUserData();
      if (isAdmin) {
        loadBranches();
      }
    }
  }, [isOpen]);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      setUserData(user);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Error al cargar datos del usuario");
    }
  };

  const loadBranches = async () => {
    try {
      const branchList = await getBranches();
      setBranches(branchList);
    } catch (error) {
      console.error("Error loading branches:", error);
    }
  };

  const handleSave = async () => {
    if (!userData) return;

    // Validar contraseñas si se proporcionan
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres");
        return;
      }
    }

    setLoading(true);
    try {
      const updatedUser = await updateUser(
        userData.document_id,
        isAdmin
          ? {
            name: userData.name,
            email: userData.email,
            document_id: userData.document_id,
            phone_number: userData.phone_number,
            username: userData.username,
            branch_id: userData.branch_id,
          }
          : {},
        newPassword || undefined
      );

      // Actualizar localStorage si cambió la sucursal
      if (updatedUser.branch_id) {
        localStorage.setItem("branch_id", String(updatedUser.branch_id));
        // Despachar evento personalizado para notificar a otros componentes
        window.dispatchEvent(new Event("branchChanged"));
      }

      toast.success("Perfil actualizado correctamente");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !userData) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Mi Perfil</h2>

        <div className="profile-form">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              disabled={isEmployee}
            />
          </div>

          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              value={userData.username}
              onChange={(e) => setUserData({ ...userData, username: e.target.value })}
              disabled={isEmployee}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              disabled={isEmployee}
            />
          </div>

          <div className="form-group">
            <label>Documento</label>
            <input
              type="text"
              value={userData.document_id}
              onChange={(e) => setUserData({ ...userData, document_id: e.target.value })}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              value={userData.phone_number || ""}
              onChange={(e) => setUserData({ ...userData, phone_number: e.target.value })}
              disabled={isEmployee}
            />
          </div>

          {isAdmin && (
            <div className="form-group">
              <label>Sede</label>
              <select
                value={userData.branch_id || ""}
                onChange={(e) => setUserData({ ...userData, branch_id: Number(e.target.value) })}
              >
                <option value="" disabled>Seleccione una sede</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Rol</label>
            <input
              type="text"
              value={userData.role}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Nueva Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Dejar en blanco para no cambiar"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar nueva contraseña"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="profile-modal-actions">
          <button onClick={handleSave} disabled={loading} className="save-btn">
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={onClose} className="cancel-btn">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
