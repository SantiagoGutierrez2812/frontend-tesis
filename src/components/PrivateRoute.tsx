// src/components/PrivateRoute.tsx
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
    if (roles && role !== null && !roles.includes(role)) {
        if (role === 2) {

            return <Navigate to="/registro" replace />;
        }

        return <Navigate to="/no-autorizado" replace />;
    }
    return children;
}