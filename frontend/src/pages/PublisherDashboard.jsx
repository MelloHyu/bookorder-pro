import { useState, useEffect, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import EditOrderModal from "../components/EditOrderModal";

const STATUS_COLORS = {
  pending:   "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  packed:    "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  shipped:   "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  delivered: "bg-green-500/20 text-green-400 border border-green-500/30",
};

export default function PublisherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedOrder, setSelected] = useState(null);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [repFilter, setRep]     = useState("");
  const [bookFilter, setBook]   = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateFrom)   params.set("date_from", dateFrom);
    if (dateTo)     params.set("date_to", dateTo);
    if (repFilter)  params.set("rep", repFilter);
    if (bookFilter) params.set("book", bookFilter);

    try {
      const res = await fetch(`http://localhost:3000/api/dispatch/orders?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, repFilter, bookFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSave = () => {
    setSelected(null);
    fetchOrders();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
        <div>
          <p className="text-lg font-bold text-blue-400">BookOrder Pro</p>
          <p className="text-xs text-gray-400">Publisher Dashboard · {user?.username}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-white border border-gray-600 px-3 py-1.5 rounded-lg"
        >
          Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Filters</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Rep Name</label>
              <input
                placeholder="Search rep..."
                value={repFilter}
                onChange={(e) => setRep(e.target.value)}
                className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Book Title</label>
              <input
                placeholder="Search book..."
                value={bookFilter}
                onChange={(e) => setBook(e.target.value)}
                className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={fetchOrders}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
            >
              Apply Filters
            </button>
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); setRep(""); setBook(""); }}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm px-4 py-2 rounded-lg"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3">
          {["pending", "packed", "shipped", "delivered"].map((s) => (
            <div key={s} className="bg-gray-800 rounded-xl p-3 border border-gray-700 text-center">
              <p className="text-2xl font-bold text-white">
                {orders.filter((o) => o.status === s).length}
              </p>
              <p className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${STATUS_COLORS[s]}`}>
                {s}
              </p>
            </div>
          ))}
        </div>

        {/* Orders table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
            <p className="font-semibold text-white">All Orders</p>
            <p className="text-xs text-gray-400">{orders.length} orders</p>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-10">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Rep</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Books</th>
                    <th className="px-4 py-3 text-left">Transport</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{order.order_date}</td>
                      <td className="px-4 py-3 text-white font-medium">{order.users?.username}</td>
                      <td className="px-4 py-3">
                        <p className="text-white">{order.customers?.name}</p>
                        <p className="text-xs text-gray-400">{order.customers?.address}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          {order.order_items?.map((item, i) => (
                            <p key={i} className="text-xs text-gray-300">
                              {item.book_title} <span className="text-white font-medium">×{item.quantity}</span>
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-300 text-xs">{order.transport_provider}</p>
                        <p className="text-gray-400 text-xs">→ {order.destination}</p>
                        {order.discount_rate > 0 && (
                          <p className="text-gray-500 text-xs">{order.discount_rate}% off</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-600 text-gray-300"}`}>
                          {order.status}
                        </span>
                        {order.lr_number && (
                          <p className="text-xs text-gray-500 mt-1">LR: {order.lr_number}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelected(order)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg"
                        >
                          Edit / Dispatch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Dispatch Modal */}
      {selectedOrder && (
        <EditOrderModal
          order={selectedOrder}
          onClose={() => setSelected(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
