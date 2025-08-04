
import "./Home.css"; 

export default function Home() {
  return (
    <div className="container">

      <header className="header">
        <div className="header-content">
          <a href="/login" className="login-link">
            Login
          </a>
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
    </div>
  );
}
