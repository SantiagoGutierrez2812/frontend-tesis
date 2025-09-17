import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MaterialForm from './Registration_and_materials/MaterialForm';
import MapaFondo from './map/map';
import Dashboard from './pages/Dashboard';
import Home from './home/home';
import Headquarters from './headquarters/headquarters';
import AdminLogs from './AdminLogs/AdminLogs';


function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/registro" element={<MaterialForm />} />
          <Route path="/mapa" element={<MapaFondo />} />
          <Route path="/headquarters" element={<Headquarters />} />
            <Route path="/adminLogs" element={<AdminLogs />} />
          
  
        </Routes>
      </div>
    </Router>
  );
}

export default App;

