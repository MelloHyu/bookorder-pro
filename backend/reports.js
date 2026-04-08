const express = require("express");
const router = express.Router();
const db = require("../db"); // your DB connection

// 1. Consolidated Book List
router.get("/books", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT title, author, SUM(quantity) AS total_units
      FROM sales
      GROUP BY title, author
      ORDER BY total_units DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Rep Performance
router.get("/rep-performance", async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const result = await db.query(`
      SELECT rep_name, SUM(quantity) AS units_sold, SUM(amount) AS revenue
      FROM sales
      WHERE sale_date BETWEEN $1 AND $2
      GROUP BY rep_name
      ORDER BY revenue DESC;
    `, [startDate, endDate]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Totals per Title
router.get("/totals-per-title", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT title, SUM(quantity) AS total_units, SUM(amount) AS total_revenue
      FROM sales
      GROUP BY title
      ORDER BY total_revenue DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
