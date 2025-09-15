  // server.js
  import express from "express";
  import mongoose from "mongoose";
  import cors from "cors";
  import dotenv from "dotenv";
  import path from "path";
  import fs from "fs";
  import { fileURLToPath } from "url";

  import authRoutes from "./routes/auth.js";
  import productRoutes from "./routes/product.js";
  import carouselRoutes from "./routes/carousel.js";
  import galleryRoutes from "./routes/gallery.js";
  import categoryRoutes from "./routes/categoryRoutes.js";

  dotenv.config();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const app = express();

  // ✅ Body parser (JSON + form-urlencoded)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ✅ CORS allow
  app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],  // frontend ka origin
    credentials: true                 // allow cookies/auth headers
  }));


  // ✅ Static uploads folder
  const uploadsDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
  app.use("/uploads", express.static(uploadsDir));

  // ✅ MongoDB connect
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

  // ✅ Routes
  app.use("/api", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/carousel", carouselRoutes);
  app.use("/api/gallery", galleryRoutes);
  // ✅ Category routes
  app.use("/api/categories", categoryRoutes);

  // ✅ Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
