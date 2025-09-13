import React, { useState } from 'react';
import Modal from './Modal/Modal';
import AddProductForm from './AddProduct/AddProductForm';
import './MaterialForm.css';

export default function MaterialForm() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="Overview">
      <div className="content">
        <div className="titele">INVENTARIO</div>
        <div className="header-content">
          <button className="add-button" onClick={() => setShowModal(true)}>+ Agregar productos</button>
        </div>
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Material</th>
              <th>Cantidad</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Laptop</td>
              <td>50</td>
              <td>$1,500</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Teclado</td>
              <td>120</td>
              <td>$75</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Mouse</td>
              <td>200</td>
              <td>$45</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <AddProductForm />
        </Modal>
      )}
    </div>
  );
}