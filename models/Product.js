import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image1: { type: String, required: true },
    image2: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
