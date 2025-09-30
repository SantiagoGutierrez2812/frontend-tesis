import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  roles: number[]; // roles que pueden entrar
  children: React.ReactNode;
}

export default function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const role = Number(localStorage.getItem("role"));

  if (!token) {
    return <Navigate to="/" replace />; // si no está logueado → redirigir al Home
  }

  if (!roles.includes(role)) {
    return <Navigate to="/" replace />; // si no tiene permisos → redirigir al Home
  }

  return <>{children}</>;
}
