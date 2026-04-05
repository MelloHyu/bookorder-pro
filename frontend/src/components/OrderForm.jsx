import { useState } from "react";
import useAuth from "../hooks/useAuth";

const BOOKS = [
  "6th Science English", "6th Science Tamil",
  "7th Science English", "7th Science Tamil",
  "8th Science English", "8th Science Tamil",
  "9th Science English", "9th Science Tamil",
  "10th Science English", "10th Science Tamil",
  "6th Social Science English", "6th Social Science Tamil",
  "7th Social Science English", "7th Social Science Tamil",
  "8th Social Science English", "8th Social Science Tamil",
  "9th Social Science English", "9th Social Science Tamil",
  "10th Social Science English", "10th Social Science Tamil",
  "6th English Workbook", "7th English Workbook",
  "8th English Workbook", "9th English Workbook", "10th English Workbook",
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

  const handleCustomer = (e) => {
    setForm((f) => ({ ...f, customer: { ...f.customer, [e.target.name]: e.target.value } }));
  };

  const handleCheck = (title) => {
    setForm((f) => {
      const items = { ...f.items };
      if (items[title]) {
        delete items[title];
      } else {
        items[title] = 1;
      }
      return { ...f, items };
    });
  };

  const handleQty = (title, val) => {
    setForm((f) => ({ ...f, items: { ...f.items, [title]: Number(val) } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const selectedItems = Object.entries(form.items)
      .filter(([, qty]) => qty > 0)
      .map(([book_title, quantity]) => ({ book_title, quantity }));

    if (selectedItems.length === 0) {
      setError("Please select at least one book.");
      return;
    }

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
    <form onSubmit={handleSubmit} className="space-y-6 p-4">

      {/* Rep name — read only */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Order Collected By</label>
        <input
          value={user?.username || ""}
          readOnly
          className="w-full bg-gray-700 text-gray-400 rounded-lg px-3 py-2 cursor-not-allowed"
        />
      </div>

      {/* Order date */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Order Date</label>
        <input
          type="date"
          value={form.order_date}
          onChange={(e) => setForm((f) => ({ ...f, order_date: e.target.value }))}
          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600"
          required
        />
      </div>

      {/* Customer info */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Customer Details</h3>
        <input
          name="name"
          placeholder="School / Institution Name"
          value={form.customer.name}
          onChange={handleCustomer}
          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600"
          required
        />
        <input
          name="address"
          placeholder="Full Address"
          value={form.customer.address}
          onChange={handleCustomer}
          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600"
          required
        />
        <input
          name="book_in_charge"
          placeholder="Book In-Charge Name"
          value={form.customer.book_in_charge}
          onChange={handleCustomer}
          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600"
          required
        />
      </div>

      {/* Book selection */}
      <div>
        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Books Ordered</h3>
        <div className="space-y-2">
          {BOOKS.map((title) => (
            <div key={title} className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2">
              <input
                type="checkbox"
                checked={!!form.items[title]}
                onChange={() => handleCheck(title)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="flex-1 text-white text-sm">{title}</span>
              {form.items[title] !== undefined && (
                <input
                  type="number"
                  min="1"
                  value={form.items[title]}
                  onChange={(e) => handleQty(title, e.target.value)}
                  className="w-16 bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-500"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Logistics */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Logistics</h3>
        <input
          placeholder="Discount % (e.g. 10)"
          type="number"
          min="0"
          max="100"
          value={form.discount_rate}
          onChange={(e) => setForm((f) => ({ ...f, discount_rate: e.target.value }))}
          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600"
        />
        <input
          placeholder="Transport Provider"
          value={form.transport_provider}
          onChange={(e) => setForm((f) => ({ ...f, transport_provider: e.target.value }))}
          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600"
          required
        />
        <input
          placeholder="Destination"
          value={form.destination}
          onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600"
          required
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">Order submitted successfully!</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Order"}
      </button>
    </form>
  );
}
