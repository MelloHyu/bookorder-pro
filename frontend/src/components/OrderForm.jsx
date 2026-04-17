import { useState } from "react";
import useAuth from "../hooks/useAuth";

const BOOKS = [
  "6th Science English",      "6th Science Tamil",
  "7th Science English",      "7th Science Tamil",
  "8th Science English",      "8th Science Tamil",
  "9th Science English",      "9th Science Tamil",
  "10th Science English",     "10th Science Tamil",
  "6th Social Science English","6th Social Science Tamil",
  "7th Social Science English","7th Social Science Tamil",
  "8th Social Science English","8th Social Science Tamil",
  "9th Social Science English","9th Social Science Tamil",
  "10th Social Science English","10th Social Science Tamil",
  "6th English Workbook",     "7th English Workbook",
  "8th English Workbook",     "9th English Workbook",  "10th English Workbook",
];

const empty = {
  customer: { name: "", address: "", book_in_charge: "" },
  items: {},
  discount_rate: "",
  transport_provider: "",
  destination: "",
  order_date: new Date().toISOString().split("T")[0],
};

export default function OrderForm({ onOrderSubmitted }) {
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCustomer = (e) =>
    setForm((f) => ({ ...f, customer: { ...f.customer, [e.target.name]: e.target.value } }));

  const handleCheck = (title) =>
    setForm((f) => {
      const items = { ...f.items };
      if (items[title]) delete items[title];
      else items[title] = 1;
      return { ...f, items };
    });

  const handleQty = (title, val) =>
    setForm((f) => ({ ...f, items: { ...f.items, [title]: Number(val) } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(false);

    const selectedItems = Object.entries(form.items)
      .filter(([, qty]) => qty > 0)
      .map(([book_title, quantity]) => ({ book_title, quantity }));

    if (selectedItems.length === 0) { setError("Please select at least one book."); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          customer: form.customer,
          items: selectedItems,
          discount_rate: Number(form.discount_rate),
          transport_provider: form.transport_provider,
          destination: form.destination,
          order_date: form.order_date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setForm(empty);
      if (onOrderSubmitted) onOrderSubmitted();
    } catch (err) {
      setError(err.message || "Failed to submit order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="order-form" onSubmit={handleSubmit}>

      {/* Rep name */}
      <div className="form-field">
        <label className="form-label">Order Collected By</label>
        <input className="form-input" value={user?.username || ""} readOnly />
      </div>

      {/* Date */}
      <div className="form-field">
        <label className="form-label">Order Date</label>
        <input
          className="form-input"
          type="date"
          value={form.order_date}
          onChange={(e) => setForm((f) => ({ ...f, order_date: e.target.value }))}
          required
        />
      </div>

      {/* Customer */}
      <div className="form-section">
        <p className="section-heading">Customer Details</p>
        <input className="form-input" name="name" placeholder="School / Institution Name"
          value={form.customer.name} onChange={handleCustomer} required />
        <input className="form-input" name="address" placeholder="Full Address"
          value={form.customer.address} onChange={handleCustomer} required />
        <input className="form-input" name="book_in_charge" placeholder="Book In-Charge Name"
          value={form.customer.book_in_charge} onChange={handleCustomer} required />
      </div>

      {/* Books */}
      <div className="form-section">
        <p className="section-heading">Books Ordered</p>
        <div className="book-list">
          {BOOKS.map((title) => (
            <div key={title} className="book-row">
              <input
                type="checkbox"
                checked={!!form.items[title]}
                onChange={() => handleCheck(title)}
              />
              <span className="book-row-title">{title}</span>
              {form.items[title] !== undefined && (
                <input
                  type="number"
                  min="1"
                  className="book-qty"
                  value={form.items[title]}
                  onChange={(e) => handleQty(title, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Logistics */}
      <div className="form-section">
        <p className="section-heading">Logistics</p>
        <input className="form-input" type="number" min="0" max="100"
          placeholder="Discount % (optional)"
          value={form.discount_rate}
          onChange={(e) => setForm((f) => ({ ...f, discount_rate: e.target.value }))} />
        <input className="form-input" placeholder="Transport Provider"
          value={form.transport_provider}
          onChange={(e) => setForm((f) => ({ ...f, transport_provider: e.target.value }))} required />
        <input className="form-input" placeholder="Destination"
          value={form.destination}
          onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} required />
      </div>

      {error   && <p className="form-error">{error}</p>}
      {success && <p className="form-success">Order submitted successfully!</p>}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Submitting..." : "Submit Order"}
      </button>

    </form>
  );
}
