import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/reports.css";

export default function Reports() {
  const navigate = useNavigate();
  const [books, setBooks]     = useState([]);
  const [reps, setReps]       = useState([]);
  const [titles, setTitles]   = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetchBooks();
    fetchTitles();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/reports/books", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setBooks(data);
    } catch { setError("Failed to load book list."); }
  };

  const fetchTitles = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/reports/totals-per-title", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setTitles(data);
    } catch { setError("Failed to load totals."); }
  };

  const fetchReps = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate)   params.set("endDate", endDate);
      const res = await fetch(`http://localhost:3000/api/reports/rep-performance?${params}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setReps(data);
      else setError(data.error || "Failed to load rep performance.");
    } catch { setError("Failed to load rep performance."); }
    finally { setLoading(false); }
  };

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
    setReps([]);
  };

  return (
    <div className="reports-page">

      {/* Header */}
      <div className="reports-header">
        <div className="reports-header-left">
          <button className="back-btn" onClick={() => navigate("/dashboard/admin")}>
            ← Dashboard
          </button>
          <div>
            <div className="reports-title">Reports</div>
            <div className="reports-subtitle">Consolidated data across all orders</div>
          </div>
        </div>
        <button className="print-btn" onClick={() => window.print()}>
          🖨 Print Report
        </button>
      </div>

      <div className="reports-body">

        {/* Error */}
        {error && <div className="reports-error">{error}</div>}

        {/* Date Filter */}
        <div className="filter-card">
          <p className="filter-card-title">Rep Performance Filter</p>
          <div className="filter-row">
            <div className="filter-field">
              <label>From Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="filter-field">
              <label>To Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <button className="apply-btn" onClick={fetchReps} disabled={loading}>
              {loading ? "Loading..." : "Apply"}
            </button>
            <button className="clear-btn" onClick={clearDates}>Clear</button>
          </div>
        </div>

        {/* Report 1 — Consolidated Book List */}
        <div className="report-card">
          <div className="report-card-header">
            <h2>Consolidated Book List</h2>
            <span className="report-badge">{books.length} titles</span>
          </div>
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Book Title</th>
                <th>Total Units</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr className="empty-row"><td colSpan={3}>No orders found</td></tr>
              ) : books.map((b, i) => (
                <tr key={i}>
                  <td className="rank">{i + 1}</td>
                  <td className="book-title">{b.title}</td>
                  <td className="units-cell">{b.total_units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Report 2 — Rep Performance */}
        <div className="report-card">
          <div className="report-card-header">
            <h2>Rep Performance</h2>
            <span className="report-badge">{reps.length} reps</span>
          </div>
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Rep Name</th>
                <th>Total Orders</th>
                <th>Units Sold</th>
              </tr>
            </thead>
            <tbody>
              {reps.length === 0 ? (
                <tr className="empty-row"><td colSpan={4}>Select a date range above and click Apply</td></tr>
              ) : reps.map((r, i) => (
                <tr key={i}>
                  <td className="rank">{i + 1}</td>
                  <td className="book-title">{r.rep_name}</td>
                  <td className="orders-cell">{r.total_orders}</td>
                  <td className="units-cell">{r.units_sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Report 3 — Totals per Title */}
        <div className="report-card">
          <div className="report-card-header">
            <h2>Totals per Title</h2>
            <span className="report-badge">{titles.length} titles</span>
          </div>
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Book Title</th>
                <th>Total Units</th>
              </tr>
            </thead>
            <tbody>
              {titles.length === 0 ? (
                <tr className="empty-row"><td colSpan={3}>No orders found</td></tr>
              ) : titles.map((t, i) => (
                <tr key={i}>
                  <td className="rank">{i + 1}</td>
                  <td className="book-title">{t.title}</td>
                  <td className="units-cell">{t.total_units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
