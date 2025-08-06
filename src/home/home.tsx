import { useState } from "react";
import "./Home.css";
import Modal from "../components/Login/Modal";

export default function Home() {
  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <button className="login-link" onClick={() => setMostrarModal(true)}>
            Login
          </button>
          <h1 className="title">Improexprees</h1>
          <div className="spacer" />
        </div>
        <p className="subtitle">Inventario</p>
      </header>

      <main className="main-content">
        <div className="tables">
          {["Tienda Norte", "Tienda Sur", "Tienda Centro"].map((tienda, index) => (
            <div key={index} className="table-card">
              <h2 className="table-title">{tienda}</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Cemento</td>
                    <td>50</td>
                  </tr>
                  <tr>
                    <td>Arena</td>
                    <td>120</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {mostrarModal && (
        <Modal cerrar={() => setMostrarModal(false)}>
          <div className="style_container">
            <h2>Iniciar sesión</h2>
            <input type="text" name="password" id="" placeholder="Usuario" />
            <input
              type="password"
              name="password"
              placeholder="Password" />
            <div className="button_styles">
              <button type="submit">
                Iniciar sesión
              </button>
              <button onClick={() => setMostrarModal(false)}>Cerrar</button>
            </div>

      
          </div>
        </Modal>
      )}
    </div>
  );
}
