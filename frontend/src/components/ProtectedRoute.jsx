import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children, role }) {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!user) {
        await fetchUser();
      }
      setLoading(false);
    };
    init();
  }, [user]);

  if (loading) return <p style={{ color: "white" }}>Loading...</p>;

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // ❌ Wrong role
  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }

  return children;
}