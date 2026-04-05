import { useState } from "react";

const STATUS_OPTIONS = ["pending", "packed", "shipped", "delivered"];

export default function EditOrderModal({ order, onClose, onSave }) {
  const [form, setForm] = useState({
    status:             order.status || "pending",
    lr_number:          order.lr_number || "",
    dispatch_date:      order.dispatch_date || "",
    transport_provider: order.transport_provider || "",
    destination:        order.destination || "",
    discount_rate:      order.discount_rate || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:3000/api/dispatch/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onSave();
    } catch (err) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl">

        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-start">
          <div>
            <p className="font-semibold text-white">Edit / Dispatch Order</p>
            <p className="text-xs text-gray-400 mt-0.5">{order.customers?.name} · {order.order_date}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>

        {/* Order summary (read only) */}
        <div className="px-6 py-3 bg-gray-900/50 border-b border-gray-700">
          <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Books in this order</p>
          <div className="space-y-1">
            {order.order_items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-300">{item.book_title}</span>
                <span className="text-white font-medium">×{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Editable fields */}
        <div className="px-6 py-4 space-y-4">

          {/* Status */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* LR Number */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">LR / Consignment Number</label>
            <input
              name="lr_number"
              placeholder="Enter LR number"
              value={form.lr_number}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 text-sm"
            />
          </div>

          {/* Dispatch date */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">Dispatch Date</label>
            <input
              type="date"
              name="dispatch_date"
              value={form.dispatch_date}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 text-sm"
            />
          </div>

          {/* Transport provider */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">Transport Provider</label>
            <input
              name="transport_provider"
              placeholder="e.g. BlueDart"
              value={form.transport_provider}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 text-sm"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">Destination</label>
            <input
              name="destination"
              placeholder="Delivery destination"
              value={form.destination}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 text-sm"
            />
          </div>

          {/* Discount */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">Discount %</label>
            <input
              type="number"
              name="discount_rate"
              min="0"
              max="100"
              placeholder="0"
              value={form.discount_rate}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 text-sm"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm py-2.5 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
