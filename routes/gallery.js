import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Gallery from "../models/Gallery.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Multer storage setup
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

// ✅ GET all gallery images
router.get("/", async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST add new gallery image
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const image = req.file ? req.file.filename : null;
    const newGallery = new Gallery({ image });
    await newGallery.save();
    res.json(newGallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT update gallery image
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: "Image not found" });

    if (req.file) {
      // Purani image delete
      const filePath = path.join("uploads", gallery.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      gallery.image = req.file.filename;
    }

    await gallery.save();
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE gallery image
router.delete("/:id", auth, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: "Image not found" });

    const filePath = path.join("uploads", gallery.image);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await gallery.deleteOne();
    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
