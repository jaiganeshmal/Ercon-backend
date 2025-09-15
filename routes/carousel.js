import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import Carousel from "../models/Carousel.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// __dirname fix for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup
// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    // special chars (#, ?, %, etc.) ko replace karo "_"
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, Date.now() + "-" + safeName);
  },
});

const upload = multer({ storage });

// ✅ GET all
router.get("/", async (req, res) => {
  const images = await Carousel.find().sort({ createdAt: -1 });
  res.json(images);
});

// ✅ POST create (field: image)
router.post("/", auth, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Image required" });

  const item = new Carousel({
    image: req.file.filename, // ✅ sirf filename save ho rha hai
  });

  await item.save();
  res.status(201).json(item);
});

// ✅ PUT update (image optional)
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const carousel = await Carousel.findById(req.params.id);
    if (!carousel) {
      return res.status(404).json({ message: "Image not found" });
    }

    // agar naya image upload hua hai
    if (req.file) {
      // purana file delete karo
      const oldPath = path.join(__dirname, "..", "uploads", carousel.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      // naya filename assign karo
      carousel.image = req.file.filename;
    }

    // save changes
    await carousel.save();

    res.json(carousel);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE carousel by ID (DB + file)
router.delete("/:id", auth, async (req, res) => {
  try {
    const carousel = await Carousel.findById(req.params.id);
    if (!carousel) {
      return res.status(404).json({ message: "Image not found" });
    }

    // File ka path banayo
    const filePath = path.join(__dirname, "..", "uploads", carousel.image);

    // Agar file exist hai to delete karo
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // DB record delete
    await carousel.deleteOne();

    res.json({ message: "Image and file deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
