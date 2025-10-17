import  { useEffect, useState, useMemo } from "react";
import Modal from "./Modal/Modal";
import TopControl from "../TopControl/TopControl";
import { get_read_from } from "../services/inventory/materials_creation_section";
import AddTransactionForm from "./AddProduct/AddProductForm";
import type { inventory_material_record } from "../services/types/inventory/inventory";
import type { Transaction } from "../services/types/Product_Transactions/transaction";
import "./MaterialForm.css";

export default function MaterialForm() {
  const [inventories, setInventories] = useState<inventory_material_record[]>([]);
  const [, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Fetch inventario
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: inventory_material_record[] = await get_read_from();
        setInventories(data);
      } catch (error) {
        console.error("Error al obtener inventario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtro y ordenamiento
  const filteredInventories = useMemo(() => {
    let current = [...inventories];

    if (search) {
      current = current.filter(
        (inv) =>
          inv.product_name.toLowerCase().includes(search.toLowerCase()) ||
          String(inv.product_id).includes(search)
      );
    }

    if (sort === "cantidad") {
      current = current.sort((a, b) => b.quantity - a.quantity);
    } else if (sort === "precio") {
      current = current.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "nombre") {
      current = current.sort((a, b) => a.product_name.localeCompare(b.product_name));
    }

    return current;
  }, [inventories, search, sort]);

  if (loading) {
    return (
      <div className="Overview">
        <div className="content">
          <h2 className="titele">Cargando inventario...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="Overview">
      <TopControl title="📦 Inventario de Productos" />
      <div className="content">
        <div className="titele">Registro de Inventario</div>

        <div className="inventory-header">
          <input
            type="text"
            placeholder="🔎 Buscar por producto, ID o sucursal..."
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
            <option value="nombre">Nombre</option>
          </select>
          <button className="add-button" onClick={() => setShowModal(true)}>
            + Agregar Transacción
          </button>
        </div>

        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Talla</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Fecha de creación</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventories.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.id}</td>
                  <td>{inv.product_name}</td>
                  <td>{inv.product_size}</td>
                  <td>{inv.quantity}</td>
                  <td>${Number(inv.price).toLocaleString("es-CO")}</td>
                  <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {filteredInventories.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#888" }}>
                    No se encontraron productos
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
            onTransactionCreated={(newTx: Transaction) =>
              setTransactions((prev: Transaction[]) => [newTx, ...prev])
            }
          />
        </Modal>
      )}
    </div>
  );
}
