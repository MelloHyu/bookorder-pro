import express from "express";
import supabase from "../lib/supabase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validate input
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // 2. Find user (matches your users table schema)
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. Compare password (bcrypt as per plan)
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 4. Create JWT (contains role + id as required)
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5. Store token in httpOnly cookie (IMPORTANT)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set true in production (https)
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000
    });

    // 6. Send response (no token exposed)
    res.json({
      message: "Login successful",
      role: user.role
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default router;