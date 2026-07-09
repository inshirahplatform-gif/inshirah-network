import { Schema, model, models } from "mongoose";

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    commissionPercentage: { type: Number, required: true, min: 0, max: 100 },
    merchantId: { type: String, required: true },
    stockQuantity: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, default: "অন্যান্য" },
    status: {
      type: String,
      required: true,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },
    imageUrl: { type: String, default: "" },
    galleryImages: { type: [String], default: [] },
    cloudinaryPublicId: { type: String, default: "" },
    // Product variants
    variants: [
      {
        size: { type: String },
        color: { type: String },
        stockQuantity: { type: Number, default: 0 },
        price: { type: Number },
      },
    ],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ merchantId: 1, status: 1 });
productSchema.index({ status: 1, createdAt: -1 });

export type ProductDocument = {
  title: string;
  description: string;
  price: number;
  commissionPercentage: number;
  merchantId: string;
  stockQuantity: number;
  category: string;
  status: "active" | "hidden" | "deleted";
  imageUrl: string;
  galleryImages: string[];
  cloudinaryPublicId: string;
  variants: Array<{
    size?: string;
    color?: string;
    stockQuantity: number;
    price?: number;
  }>;
  averageRating: number;
  totalReviews: number;
};

export const Product = models.Product ?? model("Product", productSchema);
