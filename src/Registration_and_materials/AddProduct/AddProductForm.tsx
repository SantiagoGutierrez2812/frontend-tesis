import React, { useState, useEffect } from "react";
import {
  createTransaction,
  type CreateTransactionData,
} from "../../services/Product_Transactions/Transactions";
import type { Transaction } from "../../services/types/Product_Transactions/transaction";
import { get_all_products } from "../../services/product/materials_creation_section";
import type { product_id_record } from "../../services/types/product/product";
import "./AddProductForm.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Props {
  onClose: () => void;
  onTransactionCreated: (newTransaction: Transaction) => void;
}

export default function AddTransactionForm({
  onClose,
  onTransactionCreated,
}: Props) {
  const [products, setProducts] = useState<product_id_record[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(""); 
  const [unitPrice, setUnitPrice] = useState(""); 
  const [total, setTotal] = useState(""); 
  const [transactionType, setTransactionType] = useState(2);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await get_all_products();
        setProducts(data);
        if (data.length > 0) setSelectedProduct(data[0].name);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        toast.error("No se pudieron cargar los productos");
      }
    };
    fetchProducts();
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.warning("Selecciona un producto");
      return;
    }

    const product = products.find((p) => p.name === selectedProduct);
    if (!product) {
      toast.error("Producto inválido");
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
              sendTransaction(quantityNumber, unitPriceNumber, totalNumber, product.id)
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
    totalNumber: number,
    productId: number
  ) => {
    toast.dismiss();
    setLoading(true);

    const newTxData: CreateTransactionData & { total_price?: number } = {
      description,
      quantity: quantityNumber,
      unit_price: unitPriceNumber,
      total_price: totalNumber,
      transaction_date: new Date().toISOString(),
      product_id: productId,
      branch_id: Number(localStorage.getItem("branch_id") || 1),
      transaction_type_id: transactionType,
      app_user_id: Number(localStorage.getItem("user_id") || 1),
    };

    try {
      const newTx = await createTransaction(newTxData);
      onTransactionCreated(newTx);
      toast.success("Transacción creada correctamente");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al crear la transacción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <form className="product-form" onSubmit={handleSubmit}>
        <h2 className="form-title">Registrar nueva transacción</h2>

        <label>Producto</label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          required
        >
          {products.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name} ({p.size})
            </option>
          ))}
        </select>

        <label>Descripción</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción de la transacción"
          required
        />

        <label>Cantidad</label>
        <input
          type="text"
          value={quantity}
          onChange={(e) => handleNumericInput(e.target.value, setQuantity, "Cantidad")}
          placeholder="Cantidad"
          required
        />

        <label>Precio unitario</label>
        <input
          type="text"
          value={unitPrice}
          onChange={(e) => handleNumericInput(e.target.value, setUnitPrice, "Precio unitario")}
          placeholder="Precio unitario"
          required
        />

        <label>Total</label>
        <input
          type="text"
          value={total}
          onChange={(e) => handleNumericInput(e.target.value, setTotal, "Total")}
          placeholder="Total"
        />

        <label>Tipo de transacción</label>
        <select value={transactionType} onChange={(e) => setTransactionType(Number(e.target.value))}>
          <option value={1}>Entrada</option>
          <option value={2}>Salida</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "💾 Guardar transacción"}
        </button>
      </form>
    </>
  );
}
