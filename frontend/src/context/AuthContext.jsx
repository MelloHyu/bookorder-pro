import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Initialize user session ONCE when app loads
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include"
        });

        if (res.ok) {
          const data = await res.json();

          setUser({
            username: data.username,
            role: data.role
          });
        }
      } catch (err) {
        // ❗ do nothing — don't break session flow
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}