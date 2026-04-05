import express from "express";
import supabase from "../lib/supabase.js";
import bcrypt from "bcrypt";
import requireAuth from "../middleware/requireAuth.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();


// 🔹 CREATE REP (ONLY PUBLISHER)
router.post("/", requireAuth, requireRole("publisher"), async (req, res) => {
  try {
    const { rep_id, username, password } = req.body;

    // validate
    if (!rep_id || !username || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          rep_id,
          username,
          password_hash: hashedPassword,
          role: "rep"
        }
      ]);

    if (error) throw error;

    res.json({ message: "Rep created successfully", data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔹 GET ALL USERS (ONLY PUBLISHER)
router.get("/", requireAuth, requireRole("publisher"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, rep_id, username, role, created_at");

    if (error) throw error;

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;