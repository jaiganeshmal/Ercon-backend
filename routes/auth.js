import express from "express";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";           // <- .js extension required
import { addToBlacklist } from "../utils/blacklist.js";  // <- .js extension required

const router = express.Router();

// Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "username & password required" });

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || "8h"
    });
    return res.json({ token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Logout API
router.post("/logout", auth, (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  addToBlacklist(token); // token backend pe invalidate ho gaya
  res.json({ message: "Logout successful" });
});

export default router;
