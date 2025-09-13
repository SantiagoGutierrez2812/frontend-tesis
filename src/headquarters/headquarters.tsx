import styles from './headquarters.module.css';

export default function Headquarters() {
  return (
    <div className={styles.container}>
      
      <div className={styles.titulo}><p>Estadisticas</p></div>
  
    <div className={styles.nameperson}><p>Sede sur</p></div>
    
      {/* Contenido principal en una tarjeta */}
      <div className={styles.contentCard}>
        {/* Título */}
        <h1 className={styles.title}>Inventario</h1>

        {/* Tabla */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Id</th>
                <th>Material</th>
                <th>Tamaño</th>
                <th>Persona que recibió el material</th>
                <th>Costo</th>
              </tr>
            </thead>
            <tbody className={styles.text}>
              <tr>
                <td>1</td>
                <td>Madera</td>
                <td>2m</td>
                <td>Juan Pérez</td>
                <td>$50</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Acero</td>
                <td>1m</td>
                <td>María López</td>
                <td>$80</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}