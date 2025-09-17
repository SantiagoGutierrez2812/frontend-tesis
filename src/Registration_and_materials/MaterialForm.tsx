import React, { useState } from 'react';
import Modal from './Modal/Modal';
import AddProductForm from './AddProduct/AddProductForm';
import './MaterialForm.css';

export default function MaterialForm() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');

  const products = [
    { id: 1, material: 'Laptop', cantidad: 50, costo: 1500 },
    { id: 2, material: 'Teclado', cantidad: 120, costo: 75 },
    { id: 3, material: 'Mouse', cantidad: 200, costo: 45 },
  ];

  // Calcular KPIs
  const totalCantidad = products.reduce((acc, p) => acc + p.cantidad, 0);
  const totalValor = products.reduce((acc, p) => acc + (p.costo * p.cantidad), 0);
  const productoCaro = products.reduce((max, p) => p.costo > max.costo ? p : max, products[0]);

  // Filtrar y ordenar productos
  let filtered = products.filter(p =>
    p.material.toLowerCase().includes(search.toLowerCase()) ||
    String(p.id).includes(search)
  );

  if (sort === 'cantidad') {
    filtered = [...filtered].sort((a, b) => b.cantidad - a.cantidad);
  } else if (sort === 'costo') {
    filtered = [...filtered].sort((a, b) => b.costo - a.costo);
  } else if (sort === 'nombre') {
    filtered = [...filtered].sort((a, b) => a.material.localeCompare(b.material));
  }

  return (
    <div className="Overview">
      <div className="content">
        <div className="titele">Registro de Inventario</div>

        {/* KPIs */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>{totalCantidad}</h3>
            <p>Total productos</p>
          </div>
          <div className="kpi-card">
            <h3>${totalValor.toLocaleString()}</h3>
            <p>Valor inventario</p>
          </div>
          <div className="kpi-card">
            <h3>{productoCaro.material}</h3>
            <p>Producto más caro</p>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="inventory-header">
          <input
            type="text"
            placeholder="🔎 Buscar material o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            className="filter-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Ordenar por</option>
            <option value="cantidad">Cantidad</option>
            <option value="costo">Costo</option>
            <option value="nombre">Nombre</option>
          </select>
          <button className="add-button" onClick={() => setShowModal(true)}>+ Agregar productos</button>
        </div>

        {/* Tabla */}
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Material</th>
              <th>Cantidad</th>
              <th>Costo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.material}</td>
                <td>{product.cantidad}</td>
                <td>${product.costo.toLocaleString()}</td>
                <td className="actions">
                  <button className="edit-btn">✏️</button>
                  <button className="delete-btn">🗑️</button>
                </td>
              </tr>
            ))}
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
