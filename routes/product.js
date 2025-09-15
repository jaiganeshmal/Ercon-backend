import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Product from "../models/Product.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// --------- Multer Setup ----------
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

// --------- GET: All Products ----------
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- GET: Single Product ----------
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- POST: Create Product ----------
router.post(
  "/",
  upload.fields([{ name: "image1" }, { name: "image2" }]),
  async (req, res) => {
    try {
      const { title, description, category } = req.body;

      const image1 = req.files?.image1 ? req.files.image1[0].filename : null;
      const image2 = req.files?.image2 ? req.files.image2[0].filename : null;

      if (!title || !description || !category || !image1 || !image2) {
        return res.status(400).json({ message: "All fields required" });
      }

      const newProduct = new Product({
        title,
        description,
        category,
        image1,
        image2,
      });

      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// --------- PUT: Update Product ----------
router.put(
  "/:id",
  auth,
  upload.fields([{ name: "image1" }, { name: "image2" }]),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      // Agar new image1 upload hui to update karo
      if (req.files["image1"]) {
        const filePath = path.join("uploads", product.image1);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        product.image1 = req.files["image1"][0].filename;
      }

      // Agar new image2 upload hui to update karo
      if (req.files["image2"]) {
        const filePath = path.join("uploads", product.image2);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        product.image2 = req.files["image2"][0].filename;
      }

      // Baaki fields update karo
      product.title = req.body.title || product.title;
      product.description = req.body.description || product.description;
      product.category = req.body.category || product.category;

      await product.save();
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// --------- DELETE: Product ----------
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // delete images from server
    [product.image1, product.image2].forEach((img) => {
      if (img) {
        const filePath = path.join("uploads", img);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    });

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
