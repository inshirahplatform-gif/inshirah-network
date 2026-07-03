import { Schema, model, models } from "mongoose";

const productSchema = new Schema(
  {
    title:                { type: String, required: true, trim: true },
    description:          { type: String, required: true, trim: true },
    price:                { type: Number, required: true, min: 0 },
    commissionPercentage: { type: Number, required: true, min: 0, max: 100 },
    merchantId:           { type: String, required: true },
    stockQuantity:        { type: Number, required: true, min: 0 },
    status: {
      type:     String,
      required: true,
      enum:     ["active", "hidden", "deleted"],
      default:  "active",
    },
    // ── Image storage ──────────────────────────────────────────────────────
    // Stores either a Cloudinary secure_url or a manually pasted external URL.
    imageUrl: { type: String, default: "" },
    // Set only when a file was uploaded via Cloudinary (used for cleanup on delete).
    cloudinaryPublicId: { type: String, default: "" },
  },
  { timestamps: true }
);

// Merchant product listings filtered by status
productSchema.index({ merchantId: 1, status: 1 });
// Public marketplace: newest active products first
productSchema.index({ status: 1, createdAt: -1 });

export type ProductDocument = {
  title:                string;
  description:          string;
  price:                number;
  commissionPercentage: number;
  merchantId:           string;
  stockQuantity:        number;
  status:               "active" | "hidden" | "deleted";
  imageUrl:             string;
  cloudinaryPublicId:   string;
};

export const Product = models.Product ?? model("Product", productSchema);
