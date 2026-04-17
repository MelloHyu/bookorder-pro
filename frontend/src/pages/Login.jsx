import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../styles/login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 rotating tagline
  const taglines = [
    "Manage smarter",
    "Track orders",
    "Grow faster"
  ];
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(username, password);
      if (user.role === "publisher") {
        navigate("/dashboard/admin");
      } else {
        navigate("/dashboard/rep");
      }
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* 🔥 LEFT SIDE */}
      <div className="login-left">
        <div className="left-bg"></div>

        <div className="left-content">
          <h1>BookOrder Pro</h1>

          <p key={taglineIndex} className="tagline">
            {taglines[taglineIndex]}
          </p>

          <p className="subtext">
            Built for publishers and sales teams
          </p>
        </div>
      </div>

      {/* ✅ RIGHT SIDE */}
      <div className="login-right">
        <div className="login-box">

          <h2>Sign In</h2>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="login-footer">
            Access is managed by your publisher
          </p>

        </div>
      </div>

    </div>
  );
}