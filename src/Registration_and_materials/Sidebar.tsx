
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2>Menú</h2>
      <nav>
        <ul>
          <li><Link to="/">🏠 Widget Principal</Link></li>
          <li><Link to="/registro">📝 Registro de Material</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
