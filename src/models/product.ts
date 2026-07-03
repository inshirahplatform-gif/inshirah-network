import { Schema, model, models } from "mongoose";

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    commissionPercentage: { type: Number, required: true, min: 0, max: 100 },
    merchantId: { type: String, required: true },
    stockQuantity: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Compound index: merchant product listings filtered by status (most common query)
productSchema.index({ merchantId: 1, status: 1 });
// Public marketplace query: all active products sorted by newest
productSchema.index({ status: 1, createdAt: -1 });

export type ProductDocument = {
  title: string;
  description: string;
  price: number;
  commissionPercentage: number;
  merchantId: string;
  stockQuantity: number;
  status: "active" | "hidden" | "deleted";
};

export const Product = models.Product ?? model("Product", productSchema);
