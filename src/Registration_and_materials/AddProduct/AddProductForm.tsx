import React, { useState } from "react";
import "./AddProductForm.css";
import { createTransaction } from "../../services/Product_Transactions/Transactions";
import type { Transaction } from "../../services/types/Product_Transactions/transaction";

interface Props {
  onClose: () => void;
  onTransactionCreated: (tx: Transaction) => void;
}

export default function AddTransactionForm({ onClose, onTransactionCreated }: Props) {
  const [formData, setFormData] = useState({
    description: "",
    quantity: 1,
    unit_price: 0,
    transaction_date: new Date().toISOString().split("T")[0],
    product_id: 1,
    branch_id: Number(localStorage.getItem("branch_id") || 1),
    transaction_type_id: 2,
    app_user_id: Number(localStorage.getItem("user_id") || 1),
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numericFields = ["quantity", "unit_price", "product_id", "branch_id", "transaction_type_id", "app_user_id"];
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const newTx = await createTransaction(formData);
      onTransactionCreated(newTx);
      setMessage("Transacción registrada exitosamente");
      onClose();
    } catch (err) {
      console.error("Error al crear la transacción:", err);
      setMessage("Error al registrar la transacción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-title">Registrar nueva transacción</div>

      <input
        type="text"
        name="description"
        placeholder="Descripción de la transacción"
        value={formData.description}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="quantity"
        placeholder="Cantidad"
        value={formData.quantity}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="unit_price"
        placeholder="Precio unitario"
        value={formData.unit_price}
        onChange={handleChange}
        required
      />

      <input
        type="date"
        name="transaction_date"
        value={formData.transaction_date}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="product_id"
        placeholder="ID del producto"
        value={formData.product_id}
        onChange={handleChange}
        required
      />

      <button type="submit" className="save-button" disabled={loading}>
        {loading ? "Guardando..." : "💾 Guardar transacción"}
      </button>

      {message && <p className="form-message">{message}</p>}
    </form>
  );
}
