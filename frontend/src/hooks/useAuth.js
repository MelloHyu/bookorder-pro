import { useAuthContext } from "../context/AuthContext";

export default function useAuth() {
  const { user, setUser } = useAuthContext();

  // ================= LOGIN =================
  const login = async (username, password) => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error);
    }

    const userData = {
      role: data.role,
      username: username
    };

    setUser(userData);
    return userData;
  };

  // ================= FETCH USER =================
  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include"
      });

      if (!res.ok) {
        return; // do NOT reset user blindly
      }

      const data = await res.json();

      setUser({
        username: data.username,
        role: data.role
      });

    } catch {
      return; //  silent fail, do NOT reset user
    }
  };

  // ================= LOGOUT =================
  const logout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });

    setUser(null);
  };

  return { user, login, logout, fetchUser };
}