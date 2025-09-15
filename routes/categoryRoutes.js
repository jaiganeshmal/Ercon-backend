// routes/categoryRoutes.js
import express from "express";
import Category from "../models/Category.js";

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: 1 }); // oldest → newest
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});


// --------- POST create category ----------
router.post("/", async (req, res) => {
    try {
        const { name, link } = req.body;
        if (!name || !link) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existing = await Category.findOne({ link });
        if (existing) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const newCategory = new Category({ name, link });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --------- PUT update category ----------
router.put("/:id", async (req, res) => {
    try {
        const { name, link } = req.body;
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });

        category.name = name || category.name;
        category.link = link || category.link;

        await category.save();
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --------- DELETE category ----------
router.delete("/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });

        await category.deleteOne();
        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
