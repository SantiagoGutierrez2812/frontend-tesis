import './confi.css';
import { useNavigate } from 'react-router-dom';

const ConfiWidget = () => {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate('/adminLogs')} style={{ cursor: 'pointer' }}>
      <div className="espacio3D">
        <div className="cubo3D">
          <div className="base"></div>
          <aside className="cara cara1">Administración</aside>
          <aside className="cara cara2"></aside>
          <aside className="cara cara3"></aside>
          <aside className="cara cara4"></aside>
          <aside className="cara cara5"></aside>
          <aside className="cara cara6"></aside>
        </div>
      </div>
    </div>
  );
};

export default ConfiWidget;

