import express from "express";
import supabase from "../lib/supabase.js";
import requireAuth from "../middleware/requireAuth.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

// 1. Consolidated Book List — total units per book title across all orders
router.get("/books", requireAuth, requireRole("publisher"), async (req, res) => {
  const { date_from, date_to } = req.query;

  try {
    let query = supabase
      .from("order_items")
      .select(`
        book_title,
        quantity,
        transactions ( order_date )
      `);

    const { data, error } = await query;
    if (error) throw error;

    // Filter by date if provided
    const filtered = data.filter(row => {
      const date = row.transactions?.order_date;
      if (date_from && date < date_from) return false;
      if (date_to && date > date_to) return false;
      return true;
    });

    // Aggregate by book_title
    const result = {};
    filtered.forEach(row => {
      const title = row.book_title;
      if (!result[title]) result[title] = { title, total_units: 0 };
      result[title].total_units += row.quantity;
    });

    res.json(Object.values(result).sort((a, b) => b.total_units - a.total_units));
  } catch (err) {
    console.error("GET /api/reports/books error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Rep Performance — orders count and total units per rep
router.get("/rep-performance", requireAuth, requireRole("publisher"), async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    let query = supabase
      .from("transactions")
      .select(`
        id,
        order_date,
        users ( username ),
        order_items ( quantity )
      `);

    if (startDate) query = query.gte("order_date", startDate);
    if (endDate)   query = query.lte("order_date", endDate);

    const { data, error } = await query;
    if (error) throw error;

    const result = {};
    data.forEach(order => {
      const rep = order.users?.username || "Unknown";
      if (!result[rep]) result[rep] = { rep_name: rep, total_orders: 0, units_sold: 0 };
      result[rep].total_orders += 1;
      const units = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      result[rep].units_sold += units;
    });

    res.json(Object.values(result).sort((a, b) => b.units_sold - a.units_sold));
  } catch (err) {
    console.error("GET /api/reports/rep-performance error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Totals per Title — same as books but with date range
router.get("/totals-per-title", requireAuth, requireRole("publisher"), async (req, res) => {
  const { date_from, date_to } = req.query;

  try {
    const { data, error } = await supabase
      .from("order_items")
      .select(`
        book_title,
        quantity,
        transactions ( order_date )
      `);

    if (error) throw error;

    const filtered = data.filter(row => {
      const date = row.transactions?.order_date;
      if (date_from && date < date_from) return false;
      if (date_to && date > date_to) return false;
      return true;
    });

    const result = {};
    filtered.forEach(row => {
      const title = row.book_title;
      if (!result[title]) result[title] = { title, total_units: 0 };
      result[title].total_units += row.quantity;
    });

    res.json(Object.values(result).sort((a, b) => b.total_units - a.total_units));
  } catch (err) {
    console.error("GET /api/reports/totals-per-title error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
