import { Schema, model, models } from "mongoose";

const reviewSchema = new Schema(
  {
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true }, // Only verified purchases can review
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    images: { type: [String], default: [] }, // Optional review images
    helpfulCount: { type: Number, default: 0 },
    isVerifiedPurchase: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true }); // One review per user per product

export type ReviewDocument = {
  _id: string;
  productId: string;
  userId: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
};

export const Review = models.Review ?? model("Review", reviewSchema);
