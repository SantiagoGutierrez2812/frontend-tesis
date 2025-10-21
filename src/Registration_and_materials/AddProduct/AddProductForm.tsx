import React, { useState, useEffect } from "react";
import {
  createTransaction,
  type CreateTransactionData,
} from "../../services/Product_Transactions/Transactions";
import type { Transaction } from "../../services/types/Product_Transactions/transaction";
import { get_all_products } from "../../services/product/materials_creation_section";
import type { product_id_record } from "../../services/types/product/product";
import { getSuppliers } from "../../services/supplier/supplier_service";
import type { Proveedor } from "../../services/types/supplier_interface";
import "./AddProductForm.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface TransactionType {
  id: number;
  name: string;
  description?: string;
}

interface Props {
  onClose: () => void;
  onTransactionCreated: (newTransaction: Transaction) => void;
  branchId?: number; // ID de la sede seleccionada (para admins) o del usuario
}

export default function AddTransactionForm({
  onClose,
  onTransactionCreated,
  branchId,
}: Props) {
  const [products, setProducts] = useState<product_id_record[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [total, setTotal] = useState("");
  const [transactionTypeId, setTransactionTypeId] = useState<number | null>(null);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar productos, transaction types y suppliers al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar productos
        const productsData = await get_all_products();
        setProducts(productsData);
        // NO pre-seleccionar el primer producto

        // Cargar transaction types
        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        const transactionTypesRes = await fetch(`${API_URL}/transaction_types/`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (transactionTypesRes.ok) {
          const transactionTypesData = await transactionTypesRes.json();
          if (transactionTypesData.ok && transactionTypesData.transaction_types) {
            setTransactionTypes(transactionTypesData.transaction_types);
            // NO pre-seleccionar el primer tipo de transacción
          }
        } else {
          toast.error("No se pudieron cargar los tipos de transacción");
        }

        // Cargar suppliers
        const suppliersData = await getSuppliers();
        setSuppliers(suppliersData);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        toast.error("No se pudieron cargar los datos necesarios");
      }
    };
    fetchData();
  }, []);

  // Auto-llenar unit_price cuando se selecciona un producto
  useEffect(() => {
    if (selectedProductId !== null) {
      const product = products.find((p) => p.id === selectedProductId);
      if (product) {
        setUnitPrice(product.price.toString());
      }
    }
  }, [selectedProductId, products]);

  // Calcular total automáticamente
  useEffect(() => {
    const qty = Number(quantity);
    const price = Number(unitPrice);
    if (!qty || !price) {
      setTotal("");
      return;
    }
    const t = qty * price;
    setTotal(t % 1 === 0 ? t.toString() : t.toFixed(2));
  }, [quantity, unitPrice]);

  // Resetear supplier cuando se cambia el transaction type
  useEffect(() => {
    // Solo mostrar supplier si transaction_type_id es 1 o 4
    if (transactionTypeId !== 1 && transactionTypeId !== 4) {
      setSupplierId(null);
    }
  }, [transactionTypeId]);

  const handleNumericInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    fieldName: string
  ) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setter(value);
    } else {
      toast.warning(`El campo ${fieldName} solo acepta números`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (selectedProductId === null) {
      toast.warning("Selecciona un producto");
      return;
    }

    if (transactionTypeId === null) {
      toast.warning("Selecciona un tipo de transacción");
      return;
    }

    // Validar que se seleccione supplier si el transaction type es 1 o 4
    if ((transactionTypeId === 1 || transactionTypeId === 4) && supplierId === null) {
      toast.warning("Debes seleccionar un proveedor para este tipo de transacción");
      return;
    }

    if (!description || description.trim().length < 5) {
      toast.warning("La descripción debe tener al menos 5 caracteres");
      return;
    }

    const quantityNumber = Number(quantity);
    const unitPriceNumber = Number(unitPrice);
    const totalNumber = Number(total);

    if (isNaN(quantityNumber) || quantityNumber <= 0) {
      toast.warning("Cantidad inválida");
      return;
    }
    if (isNaN(unitPriceNumber) || unitPriceNumber < 0) {
      toast.warning("Precio unitario inválido");
      return;
    }

    toast.info(
      <div>
        <p>¿Estás seguro de los datos?</p>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 10 }}>
          <button
            onClick={() =>
              sendTransaction(quantityNumber, unitPriceNumber, totalNumber)
            }
            style={{ padding: "5px 10px" }}
          >
            Aceptar
          </button>
          <button onClick={() => toast.dismiss()} style={{ padding: "5px 10px" }}>
            Cancelar
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false }
    );
  };

  const sendTransaction = async (
    quantityNumber: number,
    unitPriceNumber: number,
    totalNumber: number
  ) => {
    toast.dismiss();
    setLoading(true);

    // Formato de fecha YYYY-MM-DD que el backend acepta
    const currentDate = new Date().toISOString().split('T')[0];

    const newTxData: CreateTransactionData & { total_price?: number; supplier_id?: number } = {
      description,
      quantity: quantityNumber,
      unit_price: unitPriceNumber,
      total_price: totalNumber,
      transaction_date: currentDate,
      product_id: selectedProductId!,
      branch_id: branchId || Number(localStorage.getItem("branch_id") || 1),
      transaction_type_id: transactionTypeId!,
      app_user_id: Number(localStorage.getItem("user_id") || 1),
    };

    // Agregar supplier_id solo si aplica (transaction_type_id es 1 o 4)
    if ((transactionTypeId === 1 || transactionTypeId === 4) && supplierId !== null) {
      newTxData.supplier_id = supplierId;
    }

    try {
      const newTx = await createTransaction(newTxData);
      onTransactionCreated(newTx);
      toast.success("Transacción creada correctamente");
      onClose();
    } catch (err) {
      console.error("Error completo:", err);
      if (err instanceof Error) {
        toast.error(`Error: ${err.message}`);
      } else {
        toast.error("Error al crear la transacción");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="product-form">
        <h2 className="form-title">Registrar nueva transacción</h2>

        <form onSubmit={handleSubmit}>
          <label>Producto</label>
          <select
            value={selectedProductId ?? ""}
            onChange={(e) => setSelectedProductId(Number(e.target.value))}
            required
          >
            <option value="" disabled>
              Selecciona un producto
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.size})
              </option>
            ))}
          </select>

          <label>Tipo de transacción</label>
          <select
            value={transactionTypeId ?? ""}
            onChange={(e) => setTransactionTypeId(Number(e.target.value))}
            required
          >
            <option value="" disabled>
              Selecciona un tipo
            </option>
            {transactionTypes.map((tt) => (
              <option key={tt.id} value={tt.id}>
                {tt.name.charAt(0).toUpperCase() + tt.name.slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          {/* Mostrar supplier solo si transaction_type_id es 1 o 4 */}
          {(transactionTypeId === 1 || transactionTypeId === 4) && (
            <>
              <label>Proveedor</label>
              <select
                value={supplierId ?? ""}
                onChange={(e) => setSupplierId(Number(e.target.value))}
                required
              >
                <option value="" disabled>
                  Selecciona un proveedor
                </option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <label>Cantidad</label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => handleNumericInput(e.target.value, setQuantity, "Cantidad")}
            placeholder="Ingrese la cantidad"
            required
          />

          <label>Precio unitario</label>
          <input
            type="text"
            value={unitPrice}
            placeholder="Se auto-completa al seleccionar el producto"
            readOnly
            style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
          />

          <label>Total</label>
          <input
            type="text"
            value={total}
            placeholder="Se calcula automáticamente"
            readOnly
            style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
          />

          <label>Descripción de la transacción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ingrese una descripción (mínimo 5 caracteres)"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "💾 Guardar transacción"}
          </button>
        </form>
      </div>
    </>
  );
}
