import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./home/home";
import Dashboard from "./pages/Dashboard";
import AdminLogs from "./AdminLogs/AdminLogs";
import PrivateRoute from "./components/PrivateRoute";
import MaterialForm from "./Registration_and_materials/MaterialForm";
import MapaFondo from "./map/map";
function App() {
  return (
    <Router>
      <Routes>
        {/* Página pública */}
        <Route path="/" element={<Home />} />

        {/* Solo administradores (role 1) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute roles={[1]}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/adminLogs"
          element={
            <PrivateRoute roles={[1]}>
              <AdminLogs />
            </PrivateRoute>
          }
        />

        {/* Solo empleados (role 2) */}
        <Route
          path="/registro"
          element={
            <PrivateRoute roles={[1,2]}>
              <MaterialForm />
            </PrivateRoute>
          }
        />
         <Route
          path="/map"
          element={
            <PrivateRoute roles={[1]}>
              <MapaFondo />
            </PrivateRoute>
          }
        />
        {/* Página si no tiene permisos */}
        <Route path="/" element={<h1>No tienes permisos 🚫</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
