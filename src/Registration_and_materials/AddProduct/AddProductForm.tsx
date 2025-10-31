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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ---------- MODAL DE CONFIRMACIÓN ---------- */
function ConfirmDialog({
  open,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">⚠️</div>
        <h3 className="confirm-title">Confirmar acción</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-buttons">
          <button className="cancel-btn" onClick={onCancel}>
            Cancelar
          </button>
          <button className="accept-btn" onClick={onConfirm}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- FORMULARIO PRINCIPAL ---------- */
interface TransactionType {
  id: number;
  name: string;
  description?: string;
}

interface Props {
  onClose: () => void;
  onTransactionCreated: (newTransaction: Transaction) => void;
  branchId?: number;
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

  // Estado del modal de confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => { });

  /* -------- Cargar datos -------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await get_all_products();
        setProducts(productsData);

        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/transaction_types/`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.transaction_types) setTransactionTypes(data.transaction_types);
        } else {
          toast.error("No se pudieron cargar los tipos de transacción");
        }

        const suppliersData = await getSuppliers();
        setSuppliers(suppliersData);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        toast.error("No se pudieron cargar los datos necesarios");
      }
    };
    fetchData();
  }, []);

  /* -------- Auto completar precio y total -------- */
  useEffect(() => {
    if (selectedProductId !== null) {
      const p = products.find((x) => x.id === selectedProductId);
      if (p) setUnitPrice(p.price.toString());
    }
  }, [selectedProductId, products]);

  useEffect(() => {
    const qty = Number(quantity);
    const price = Number(unitPrice);
    if (!qty || !price) return setTotal("");
    const t = qty * price;
    setTotal(t % 1 === 0 ? t.toString() : t.toFixed(2));
  }, [quantity, unitPrice]);

  useEffect(() => {
    if (transactionTypeId !== 1 && transactionTypeId !== 4) setSupplierId(null);
  }, [transactionTypeId]);

  /* -------- Validaciones -------- */
  const handleNumericInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    field: string
  ) => {
    if (/^\d*\.?\d*$/.test(value)) setter(value);
    else toast.warning(`El campo ${field} solo acepta números`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProductId === null) return toast.warning("Selecciona un producto");
    if (transactionTypeId === null)
      return toast.warning("Selecciona un tipo de transacción");
    if ((transactionTypeId === 1 || transactionTypeId === 4) && supplierId === null)
      return toast.warning("Debes seleccionar un proveedor");
    if (!description || description.trim().length < 5)
      return toast.warning("La descripción debe tener al menos 5 caracteres");

    const quantityNumber = Number(quantity);
    const unitPriceNumber = Number(unitPrice);
    const totalNumber = Number(total);
    if (isNaN(quantityNumber) || quantityNumber <= 0)
      return toast.warning("Cantidad inválida");
    if (isNaN(unitPriceNumber) || unitPriceNumber < 0)
      return toast.warning("Precio unitario inválido");

    // Mostrar modal de confirmación
    setConfirmOpen(true);
    setConfirmAction(() => () =>
      sendTransaction(quantityNumber, unitPriceNumber, totalNumber)
    );
  };

  /* -------- Envío -------- */
  const sendTransaction = async (
    quantityNumber: number,
    unitPriceNumber: number,
    totalNumber: number
  ) => {
    setConfirmOpen(false);
    setLoading(true);

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      toast.error("Error de autenticacion. Por favor, inicie sesion nuevamente");
      setLoading(false);
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0];
    const newTxData: CreateTransactionData & {
      total_price?: number;
      supplier_id?: number;
    } = {
      description,
      quantity: quantityNumber,
      unit_price: unitPriceNumber,
      total_price: totalNumber,
      transaction_date: currentDate,
      product_id: selectedProductId!,
      branch_id: branchId || Number(localStorage.getItem("branch_id")),
      transaction_type_id: transactionTypeId!,
      app_user_id: Number(userId),
    };

    if ((transactionTypeId === 1 || transactionTypeId === 4) && supplierId !== null)
      newTxData.supplier_id = supplierId;

    try {
      const newTx = await createTransaction(newTxData);
      toast.success("Transaccion creada correctamente");
      onTransactionCreated(newTx);
      // Cerrar modal después de un pequeño delay para permitir que se muestre el toast
      setTimeout(() => onClose(), 100);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error:", err);
        const errorMessage = err.message || "Error al crear la transaccion";

        // Verificar si el error es sobre stock insuficiente
        if (errorMessage.includes("stock") || errorMessage.includes("suficiente")) {
          toast.error(errorMessage);
        } else {
          toast.error("Error al crear la transaccion");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

      <ConfirmDialog
        open={confirmOpen}
        message="¿Estás seguro de los datos ingresados?"
        onConfirm={confirmAction}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
