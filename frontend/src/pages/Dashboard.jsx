import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1>Dashboard</h1>

        {user ? (
          <>
            <p>Welcome, <strong>{user.username}</strong></p>
            <p>Role: <strong>{user.role}</strong></p>
          </>
        ) : (
          <p>Loading user...</p>
        )}

        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}