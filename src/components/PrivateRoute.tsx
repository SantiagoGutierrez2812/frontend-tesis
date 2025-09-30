import { Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "../utils/auth";
import type { JSX } from "react";

interface PrivateRouteProps {
  children: JSX.Element;
  roles?: number[]; // ej: [1] solo admin, [1,2] admin y empleados
}

export default function PrivateRoute({ children, roles }: PrivateRouteProps) {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  const role = Number(getRole());
  if (roles && !roles.includes(role)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}