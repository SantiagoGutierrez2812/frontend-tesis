import { useNavigate } from 'react-router-dom';
import './material.css';

const Loader = () => {
  const navigate = useNavigate();

  return (
    <div className="loader-wrapper">
      <div
        onClick={() => navigate('/crear_material')}
        style={{ cursor: 'pointer' }}
        className="widget"
      >
        <p className="loader-title">REGISTRO DE MATERIAL</p>
        <div className="boxes">
          <div className="box">
            <div />
            <div />
            <div />
            <div />
          </div>
          <div className="box">
            <div />
            <div />
            <div />
            <div />
          </div>
          <div className="box">
            <div />
            <div />
            <div />
            <div />
          </div>
          <div className="box">
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loader;
