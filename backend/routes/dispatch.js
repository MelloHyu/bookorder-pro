import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Dispatch route working");
});

export default router;