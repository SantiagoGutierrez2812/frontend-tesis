import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.css";
import Home from "./home/home";
import Dashboard from "./pages/Dashboard";
import AdminLogs from "./AdminLogs/AdminLogs";
import MaterialForm from "./Registration_and_materials/MaterialForm";
import MapaFondo from "./map/map";
import Headquarters from "./headquarters/headquarters";
import { VisualStaff } from "./staff/visual_staff"; 
import PrivateRoute from "./components/PrivateRoute";
import Materialcreation from "./materialcreation/materialcreation";
import SupplierManagement from "./Suppliers/gestionProveedores";
import UserSessionManager from "./components/UserSessionManager"; 

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                
                <Route path="/dashboard" element={
                    <UserSessionManager>
                        <PrivateRoute roles={[1]}><Dashboard /></PrivateRoute>
                    </UserSessionManager>
                } />
                
                <Route path="/mapa" element={
                    <UserSessionManager>
                        <PrivateRoute roles={[1]}><MapaFondo /></PrivateRoute>
                    </UserSessionManager>
                } />
                
                
                <Route path="/headquarters" element={
                    <UserSessionManager>
                        <PrivateRoute roles={[1]}><Headquarters /></PrivateRoute>
                    </UserSessionManager>
                } />
                
                <Route path="/adminLogs" element={
                    <UserSessionManager>
                        <PrivateRoute roles={[1]}><AdminLogs /></PrivateRoute>
                    </UserSessionManager>
                } />
                
                <Route path="/registro_personal" element={
                    <UserSessionManager>
                        <PrivateRoute roles={[1]}><VisualStaff /></PrivateRoute>
                    </UserSessionManager>
                } />
                
                <Route path="/personal" element={
                    <UserSessionManager>
                        <PrivateRoute roles={[1]}><VisualStaff /></PrivateRoute>
                    </UserSessionManager>
                } />
                
                <Route path="/registro" element={
                    <UserSessionManager>
                        <PrivateRoute roles={[1,2]}><MaterialForm /></PrivateRoute>
                    </UserSessionManager>
                } />
                
                <Route path="/gestion_proveedores" element={
                    <UserSessionManager>
                        <PrivateRoute roles={[1]}><SupplierManagement /></PrivateRoute>
                    </UserSessionManager>
                } />
                
                <Route path="/crear_material" element={
                    <UserSessionManager>
                        <PrivateRoute roles={[1]}><Materialcreation /></PrivateRoute>
                    </UserSessionManager>
                } />
            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </Router>
    );
}

export default App;


