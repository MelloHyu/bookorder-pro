import express from "express";
import supabase from "../lib/supabase.js";

const router = express.Router();

/**
 * 1. Consolidated Book List
 * Total units sold per book
 */
router.get("/books", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("order_items")
      .select(`
        quantity,
        books(title, author)
      `);

    if (error) throw error;

    // Aggregate manually
    const result = {};
    data.forEach(row => {
      const key = row.books.title;
      if (!result[key]) {
        result[key] = {
          title: row.books.title,
          author: row.books.author,
          total_units: 0
        };
      }
      result[key].total_units += row.quantity;
    });

    res.json(Object.values(result));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * 2. Rep Performance (with date filter)
 */
router.get("/rep-performance", async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        created_at,
        users(name),
        order_items(quantity)
      `)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (error) throw error;

    const result = {};

    data.forEach(order => {
      const rep = order.users.name;

      if (!result[rep]) {
        result[rep] = {
          rep_name: rep,
          units_sold: 0,
          revenue: 0
        };
      }

      const units = order.order_items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      result[rep].units_sold += units;
      result[rep].revenue += order.total_amount;
    });

    res.json(Object.values(result));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * 3. Totals per Title
 */
router.get("/totals-per-title", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("order_items")
      .select(`
        quantity,
        price,
        books(title)
      `);

    if (error) throw error;

    const result = {};

    data.forEach(row => {
      const title = row.books.title;

      if (!result[title]) {
        result[title] = {
          title,
          total_units: 0,
          total_revenue: 0
        };
      }

      result[title].total_units += row.quantity;
      result[title].total_revenue += row.quantity * row.price;
    });

    res.json(Object.values(result));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
