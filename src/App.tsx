import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
  // import PowerWidget from './widget/stores/PowerWidget';
import MaterialForm from './Registration_and_materials/MaterialForm';
// import HumidityWidget from './widget/rank/HumidityWidget';
import MapaFondo from './map/map';
import Dashboard from './pages/Dashboard';
import Home from './home/home'
function App() {
  return (
    <Router>
      <div className="app-container" >
          <Routes>
             <Route path="/" element={<Home/>} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/registro" element={<MaterialForm />} />
            <Route path="/mapa" element={<MapaFondo />} />
          </Routes>
      </div>
    </Router>
  );
}

export default App;
