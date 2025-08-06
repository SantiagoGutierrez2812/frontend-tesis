// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Registration_and_materials/Sidebar';
import PowerWidget from './widget/stores/PowerWidget';
import MaterialForm from './Registration_and_materials/MaterialForm';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main style={{ flexGrow: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<PowerWidget />} />
            <Route path="/registro" element={<MaterialForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
