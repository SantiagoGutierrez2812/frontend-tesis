
import './AddProductForm.css';

export default function AddProductForm() {
  return (
    <form className="product-form">
      <div className="form-title">Registro de Inventario</div>
      <input type="text" placeholder="Nombre de material" />
      <input type="text" placeholder="Tamaño de material" />
      <input type="text" placeholder="Nombre de la persona que insertó el material" />
      <select>
        <option>Cantidad de material</option>
        <option>10</option>
        <option>20</option>
        <option>50</option>
      </select>
      <select>
        <option>Observaciones</option>
        <option>Observación 1</option>
        <option>Observación 2</option>
      </select>
      <input type="text" placeholder="Costo de material" />
      <button type="submit" className="save-button">Botón de guardar todo</button>
    </form>
  );
}