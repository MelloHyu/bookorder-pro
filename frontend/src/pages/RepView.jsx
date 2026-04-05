import { useState, useEffect, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import OrderForm from "../components/OrderForm";
import StatusTab from "../components/StatusTab";

export default function RepView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("new"); // "new" | "status"
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("http://localhost:3000/api/orders/mine", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch {
      // silent fail
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Load orders when switching to status tab
  useEffect(() => {
    if (tab === "status") fetchOrders();
  }, [tab, fetchOrders]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div>
          <p className="font-bold text-blue-400">BookOrder Pro</p>
          <p className="text-xs text-gray-400">Rep: {user?.username}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-white border border-gray-600 px-3 py-1 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-gray-700 sticky top-[57px] bg-gray-900 z-10">
        <button
          onClick={() => setTab("new")}
          className={`flex-1 py-3 text-sm font-medium ${
            tab === "new"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400"
          }`}
        >
          New Order
        </button>
        <button
          onClick={() => setTab("status")}
          className={`flex-1 py-3 text-sm font-medium ${
            tab === "status"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400"
          }`}
        >
          My Orders
        </button>
      </div>

      {/* Tab content */}
      <div className="max-w-lg mx-auto">
        {tab === "new" && (
          <OrderForm onOrderSubmitted={() => setTab("status")} />
        )}

        {tab === "status" && (
          loadingOrders
            ? <p className="text-center text-gray-400 py-8">Loading orders...</p>
            : <StatusTab orders={orders} setOrders={setOrders} />
        )}
      </div>
    </div>
  );
}
