import  { useEffect, useState, useMemo } from "react";
import Modal from "./Modal/Modal";
import TopControl from "../TopControl/TopControl";
import ProfileModal from "./ProfileModal/ProfileModal";
import { get_read_from } from "../services/inventory/materials_creation_section";
import { getBranches } from "../services/branchService/branchService";
import type { Branch } from "../services/types/branch/branchService";
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
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Control de sedes para administradores
  const userRole = localStorage.getItem("role");
  const isAdmin = userRole === "1";

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(() => {
    return Number(localStorage.getItem("branch_id")) || 0;
  });

  // Escuchar cambios de branch_id en localStorage
  useEffect(() => {
    const handleBranchChange = () => {
      const newBranchId = Number(localStorage.getItem("branch_id"));
      if (newBranchId && newBranchId !== selectedBranchId) {
        setSelectedBranchId(newBranchId);
      }
    };

    // Escuchar evento personalizado branchChanged
    window.addEventListener("branchChanged", handleBranchChange);

    // También verificar cuando el componente recupera el foco (al navegar de regreso a esta página)
    window.addEventListener("focus", handleBranchChange);

    return () => {
      window.removeEventListener("branchChanged", handleBranchChange);
      window.removeEventListener("focus", handleBranchChange);
    };
  }, [selectedBranchId]);

  // Cargar sedes si es administrador
  useEffect(() => {
    if (isAdmin) {
      const loadBranches = async () => {
        try {
          const branchList = await getBranches();
          setBranches(branchList);
          // Si no tiene branch asignado, seleccionar la primera sede
          const currentBranchId = Number(localStorage.getItem("branch_id"));
          if (!currentBranchId && branchList.length > 0 && selectedBranchId === 0) {
            setSelectedBranchId(branchList[0].id);
          }
        } catch (error) {
          console.error("Error al cargar sedes:", error);
        }
      };
      loadBranches();
    }
  }, [isAdmin]);

  // Función para cargar inventario (extraída para reutilizar)
  const fetchInventoryData = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      // Filtrar por sede: admin usa la seleccionada, usuario usa la suya
      const currentBranchId = Number(localStorage.getItem("branch_id"));
      const branchId = isAdmin ? (selectedBranchId || undefined) : currentBranchId;
      const data: inventory_material_record[] = await get_read_from(branchId);
      setInventories(data);
    } catch (error) {
      console.error("Error al obtener inventario:", error);
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  };

  // Fetch inventario al montar el componente y cuando cambie la sede seleccionada
  useEffect(() => {
    if (selectedBranchId > 0) {
      fetchInventoryData();
    }
  }, [selectedBranchId]);

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
      <TopControl
        title="📦 Inventario de Productos"
        extraMenuOption={{
          label: "Perfil",
          icon: "👤",
          onClick: () => setShowProfileModal(true)
        }}
      />
      <div className="content">
        <div className="titele">Registro de Inventario</div>

        <div className="inventory-header">
          {/* Select de sedes - Solo para administradores */}
          {isAdmin && (
            <select
              className="filter-select"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(Number(e.target.value))}
              style={{ marginRight: "10px" }}
            >
              <option value={0} disabled>Seleccione una sede</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          )}

          <input
            type="text"
            placeholder="🔎 Buscar por producto, ID..."
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
                <th>Tamaño</th>
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
            branchId={isAdmin ? selectedBranchId : Number(localStorage.getItem("branch_id")) || 0}
            onTransactionCreated={(newTx: Transaction) => {
              setTransactions((prev: Transaction[]) => [newTx, ...prev]);
              fetchInventoryData(false);
            }}
          />
        </Modal>
      )}

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}
