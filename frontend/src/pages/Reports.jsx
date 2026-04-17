import { useEffect, useState } from "react";
import "../styles/reports.css";

export default function Reports() {
  const [books, setBooks] = useState([]);
  const [reps, setReps] = useState([]);
  const [titles, setTitles] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBooks();
    fetchTitles();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/reports/books", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setBooks(data);
    } catch {
      setError("Failed to load book list.");
    }
  };

  const fetchTitles = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/reports/totals-per-title", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setTitles(data);
    } catch {
      setError("Failed to load totals.");
    }
  };

  const fetchReps = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`http://localhost:3000/api/reports/rep-performance?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setReps(data);
      else setError(data.error || "Failed to load rep performance.");
    } catch {
      setError("Failed to load rep performance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports">
      <h1>Reports Dashboard</h1>

      {/* Filters */}
      <div className="filters">
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
        <button onClick={fetchReps} disabled={loading}>
          {loading ? "Loading..." : "Apply"}
        </button>
        <button onClick={() => window.print()}>Print</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Report 1 — Consolidated Book List */}
      <h2>Consolidated Book List</h2>
      <table>
        <thead>
          <tr>
            <th>Book Title</th>
            <th>Total Units</th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 ? (
            <tr><td colSpan={2}>No data</td></tr>
          ) : books.map((b, i) => (
            <tr key={i}>
              <td>{b.title}</td>
              <td>{b.total_units}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Report 2 — Rep Performance */}
      <h2>Rep Performance</h2>
      <table>
        <thead>
          <tr>
            <th>Rep</th>
            <th>Total Orders</th>
            <th>Units Sold</th>
          </tr>
        </thead>
        <tbody>
          {reps.length === 0 ? (
            <tr><td colSpan={3}>Apply date filter to see rep performance</td></tr>
          ) : reps.map((r, i) => (
            <tr key={i}>
              <td>{r.rep_name}</td>
              <td>{r.total_orders}</td>
              <td>{r.units_sold}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Report 3 — Totals per Title */}
      <h2>Totals per Title</h2>
      <table>
        <thead>
          <tr>
            <th>Book Title</th>
            <th>Total Units</th>
          </tr>
        </thead>
        <tbody>
          {titles.length === 0 ? (
            <tr><td colSpan={2}>No data</td></tr>
          ) : titles.map((t, i) => (
            <tr key={i}>
              <td>{t.title}</td>
              <td>{t.total_units}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
