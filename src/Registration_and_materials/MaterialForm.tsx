
import "./MaterialForm.css";

export default function MaterialForm() {
  return (
    <form className="material-form">
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
        <option>Opecevciones</option>
        <option>Observación 1</option>
        <option>Observación 2</option>
      </select>
      <input type="text" placeholder="Costo de material" />
      <button type="submit">Botón de guardar todo</button>
    </form>
  );
}
