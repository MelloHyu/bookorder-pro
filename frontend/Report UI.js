import React, { useEffect, useState } from "react";
import axios from "axios";
import "./reports.css";

export default function Reports() {
  const [books, setBooks] = useState([]);
  const [reps, setReps] = useState([]);
  const [titles, setTitles] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchBooks();
    fetchTitles();
  }, []);

  const fetchBooks = async () => {
    const res = await axios.get("/api/reports/books");
    setBooks(res.data);
  };

  const fetchTitles = async () => {
    const res = await axios.get("/api/reports/totals-per-title");
    setTitles(res.data);
  };

  const fetchReps = async () => {
    const res = await axios.get("/api/reports/rep-performance", {
      params: { startDate, endDate }
    });
    setReps(res.data);
  };

  return (
    <div className="reports">
      <h1>Reports Dashboard</h1>

      {/* Date Filter */}
      <div className="filters">
        <input type="date" onChange={e => setStartDate(e.target.value)} />
        <input type="date" onChange={e => setEndDate(e.target.value)} />
        <button onClick={fetchReps}>Apply</button>
      </div>

      {/* Book List */}
      <h2>Consolidated Book List</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Units</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b, i) => (
            <tr key={i}>
              <td>{b.title}</td>
              <td>{b.author}</td>
              <td>{b.total_units}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Rep Performance */}
      <h2>Rep Performance</h2>
      <table>
        <thead>
          <tr>
            <th>Rep</th>
            <th>Units</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {reps.map((r, i) => (
            <tr key={i}>
              <td>{r.rep_name}</td>
              <td>{r.units_sold}</td>
              <td>{r.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals per Title */}
      <h2>Totals per Title</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Units</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {titles.map((t, i) => (
            <tr key={i}>
              <td>{t.title}</td>
              <td>{t.total_units}</td>
              <td>{t.total_revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
