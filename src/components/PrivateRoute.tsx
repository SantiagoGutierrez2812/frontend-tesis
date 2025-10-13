import { Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "../utils/auth";
import type { JSX } from "react";

interface PrivateRouteProps {
    children: JSX.Element;
    roles?: number[];
}

export default function PrivateRoute({ children, roles }: PrivateRouteProps) {
    if (!isLoggedIn()) {
        return <Navigate to="/" replace />;
    }

    const role = getRole();
    const numericRole = role !== null ? Number(role) : null;

    if (roles && numericRole !== null && !roles.includes(numericRole)) {
        if (numericRole === 2) {
            return <Navigate to="/registro" replace />;
        }
        return <Navigate to="/no-autorizado" replace />;
    }

    return children;
}
