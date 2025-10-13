import React, { useEffect, useState, useMemo } from "react";
import Modal from "./Modal/Modal";
import "./MaterialForm.css";
import TopControl from "../TopControl/TopControl";
import { getTransactions } from "../services/Product_Transactions/Transactions";
import type { Transaction } from "../services/types/Product_Transactions/transaction";
import AddTransactionForm from "./AddProduct/AddProductForm";

const storedBranchId = localStorage.getItem("branch_id");
const storedRole = localStorage.getItem("role");
const isAdmin = storedRole === "1";

export default function MaterialForm() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const userBranchId = storedBranchId;

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const parseDateStart = (val: string): Date | null => {
    if (!val) return null;
    const [y, m, d] = val.split("-").map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  };

  const parseDateEnd = (val: string): Date | null => {
    if (!val) return null;
    const [y, m, d] = val.split("-").map(Number);
    return new Date(y, m - 1, d, 23, 59, 59, 999);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Error al obtener transacciones:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTransactions = useMemo(() => {
    let currentFiltered = transactions;

    if (!isAdmin && userBranchId) {
      currentFiltered = currentFiltered.filter(
        (tx) => String(tx.branch_id) === String(userBranchId)
      );
    }

    currentFiltered = currentFiltered.filter((tx) => {
      const matchesSearch =
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        String(tx.id).includes(search);

      const created = tx.transaction_date ? new Date(tx.transaction_date) : null;
      const desde = parseDateStart(fechaDesde);
      const hasta = parseDateEnd(fechaHasta);

      const matchesDate =
        (!desde || (created && created >= desde)) &&
        (!hasta || (created && created <= hasta));

      return matchesSearch && matchesDate;
    });

    if (sort === "cantidad") {
      currentFiltered.sort((a, b) => b.quantity - a.quantity);
    } else if (sort === "precio") {
      currentFiltered.sort((a, b) => b.unit_price - a.unit_price);
    } else if (sort === "descripcion") {
      currentFiltered.sort((a, b) =>
        a.description.localeCompare(b.description)
      );
    }

    return currentFiltered;
  }, [transactions, search, fechaDesde, fechaHasta, sort, isAdmin, userBranchId]);

  const totalCantidad = filteredTransactions.reduce(
    (acc, tx) => acc + tx.quantity,
    0
  );

  const totalValorRaw = filteredTransactions.reduce(
    (acc, tx) => acc + tx.quantity * tx.unit_price,
    0
  );

  const totalValor = Math.round(totalValorRaw / 1000);

  const transaccionAlta =
    filteredTransactions.length > 0
      ? filteredTransactions.reduce(
          (max, tx) =>
            tx.unit_price > max.unit_price ? tx : max,
          filteredTransactions[0]
        )
      : { description: "N/A", unit_price: 0 };

  if (loading) {
    return (
      <div className="Overview">
        <div className="content">
          <h2 className="titele">Cargando transacciones...</h2>
        </div>
      </div>
    );
  }

  const dashboardTitle = isAdmin
    ? "🚀 Panel de Administración - Transacciones"
    : userBranchId
    ? `Transacciones de Sucursal ID: ${userBranchId}`
    : "Transacciones de Sucursal";

  return (
    <div className="Overview">
      <TopControl title={dashboardTitle} />
      <div className="content">
        <div className="titele">Registro de Transacciones</div>

        <div className="kpi-container">
          <div className="kpi-card">
            <h3>{totalCantidad.toLocaleString("es-CO")}</h3>
            <p>Total unidades</p>
          </div>
          <div className="kpi-card">
            <h3>${totalValor.toLocaleString("es-CO")}K</h3>
            <p>Valor total</p>
          </div>
          <div className="kpi-card">
            <h3>{transaccionAlta.description}</h3>
            <p>Transacción más costosa</p>
          </div>
        </div>

        <div className="inventory-header">
          <input
            type="text"
            placeholder="🔎 Buscar por descripción o ID..."
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
            <option value="precio">Precio</option>
            <option value="descripcion">Descripción</option>
          </select>
          <button className="add-button" onClick={() => setShowModal(true)}>
            + Nueva transacción
          </button>
        </div>

        <div className="date-filter">
          <label>
            Desde:
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </label>
          <label>
            Hasta:
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </label>
        </div>

        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, index) => (
                <tr key={tx.id}>
                  <td>{index + 1}</td>
                  <td>{tx.description}</td>
                  <td>{tx.quantity}</td>
                  <td>${tx.unit_price.toLocaleString("es-CO")}</td>
                  <td>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                  <td className="actions">
                    <button className="edit-btn">✏️</button>
                    <button className="delete-btn">🗑️</button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#888" }}>
                    No se encontraron transacciones en este rango
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <AddTransactionForm
            onClose={() => setShowModal(false)}
            onTransactionCreated={(tx) => setTransactions((prev) => [tx, ...prev])}
          />
        </Modal>
      )}
    </div>
  );
}
