import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdleTimer } from '../services/services/useIdleTimer'; 

// 1. Define la interfaz de props que incluye 'children'
interface UserSessionManagerProps {
    children: React.ReactNode; 
}

// 2. Asigna la interfaz al componente
const UserSessionManager: React.FC<UserSessionManagerProps> = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = React.useCallback(() => {
        localStorage.removeItem("token");
        
        console.log("Sesión cerrada por inactividad.");
        
        alert("Tu sesión ha sido cerrada por inactividad. Por favor, vuelve a ingresar.");

        navigate("/"); 
        
    }, [navigate]);


    useIdleTimer(handleLogout);

    return <>{children}</>;
};

export default UserSessionManager;