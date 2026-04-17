import { useState, useEffect, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import OrderForm from "../components/OrderForm";
import StatusTab from "../components/StatusTab";
import "../styles/rep.css";

export default function RepView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("new");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("http://localhost:3000/api/orders/mine", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch { /* silent */ }
    finally { setLoadingOrders(false); }
  }, []);

  useEffect(() => {
    if (tab === "status") fetchOrders();
  }, [tab, fetchOrders]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="rep-page">

      {/* Header */}
      <div className="rep-header">
        <div>
          <div className="rep-header-brand">BookOrder Pro</div>
          <div className="rep-header-sub">Rep: {user?.username}</div>
        </div>
        <button className="rep-logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Tabs */}
      <div className="rep-tabs">
        <button className={`rep-tab ${tab === "new" ? "active" : ""}`} onClick={() => setTab("new")}>
          New Order
        </button>
        <button className={`rep-tab ${tab === "status" ? "active" : ""}`} onClick={() => setTab("status")}>
          My Orders
        </button>
      </div>

      {/* Content */}
      <div className="rep-body">
        {tab === "new" && <OrderForm onOrderSubmitted={() => setTab("status")} />}
        {tab === "status" && (
          loadingOrders
            ? <p className="rep-loading">Loading your orders...</p>
            : <StatusTab orders={orders} setOrders={setOrders} />
        )}
      </div>

    </div>
  );
}
