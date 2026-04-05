import express from "express";
import supabase from "../lib/supabase.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// POST /api/orders — rep submits a new order
router.post("/", requireAuth, async (req, res) => {
  const { customer, items, discount_rate, transport_provider, destination, order_date } = req.body;
  const rep_id = req.user.id;

  try {
    // 1. Upsert customer (reuse if same name+address, else create new)
    let { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("name", customer.name)
      .eq("address", customer.address)
      .single();

    let customer_id;

    if (existingCustomer) {
      customer_id = existingCustomer.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({ name: customer.name, address: customer.address, book_in_charge: customer.book_in_charge })
        .select("id")
        .single();

      if (customerError) throw customerError;
      customer_id = newCustomer.id;
    }

    // 2. Create the transaction (always a new row, even same customer)
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        customer_id,
        rep_id,
        order_date,
        discount_rate,
        transport_provider,
        destination,
        status: "pending"
      })
      .select("id")
      .single();

    if (txError) throw txError;

    // 3. Insert order items (one row per book title)
    const orderItems = items.map((item) => ({
      transaction_id: transaction.id,
      book_title: item.book_title,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    res.status(201).json({ message: "Order created", transaction_id: transaction.id });
  } catch (err) {
    console.error("POST /api/orders error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET /api/orders/mine — rep sees only their own orders
router.get("/mine", requireAuth, async (req, res) => {
  const rep_id = req.user.id;

  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        order_date,
        discount_rate,
        transport_provider,
        destination,
        status,
        dispatch_date,
        lr_number,
        customers ( name, address, book_in_charge ),
        order_items ( book_title, quantity )
      `)
      .eq("rep_id", rep_id)
      .order("order_date", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("GET /api/orders/mine error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/all — publisher sees all orders (used by P4)
router.get("/all", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        order_date,
        discount_rate,
        transport_provider,
        destination,
        status,
        dispatch_date,
        lr_number,
        customers ( name, address, book_in_charge ),
        order_items ( book_title, quantity ),
        users ( username, rep_id )
      `)
      .order("order_date", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("GET /api/orders/all error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PATCH /api/orders/:id — publisher edits an order
router.patch("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    res.json({ message: "Order updated" });
  } catch (err) {
    console.error("PATCH /api/orders/:id error:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
