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
import { VisualStaff } from "./staff/visual_staff"; // <-- import nombrado

import PrivateRoute from "./components/PrivateRoute";
import Materialcreation from "./materialcreation/materialcreation";
import SupplierManagement from "./Suppliers/gestionProveedores";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<PrivateRoute roles={[1]}><Dashboard /></PrivateRoute>} />
        <Route path="/mapa" element={<PrivateRoute roles={[1]}><MapaFondo /></PrivateRoute>} />
        <Route path="/headquarters" element={<PrivateRoute roles={[1]}><Headquarters /></PrivateRoute>} />
        <Route path="/adminLogs" element={<PrivateRoute roles={[1]}><AdminLogs /></PrivateRoute>} />
        <Route path="/registro_personal" element={<PrivateRoute roles={[1]}><VisualStaff /></PrivateRoute>} />
        <Route path="/personal" element={<PrivateRoute roles={[1]}><VisualStaff /></PrivateRoute>} />
        <Route path="/registro" element={<PrivateRoute roles={[1,2]}><MaterialForm /></PrivateRoute>} />
        <Route path="/gestion_proveedores" element={<PrivateRoute roles={[1]}><SupplierManagement /></PrivateRoute>} />
        <Route path="/crear_material" element={<PrivateRoute roles={[1]}><Materialcreation /></PrivateRoute>} />
        <Route path="/no-autorizado" element={<h1>No tienes permisos para ver esta página 🚫</h1>} />
        <Route path="*" element={<h1>404 | Página no encontrada</h1>} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
