import { Schema, model, models } from "mongoose";

const wishlistSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true }); // One entry per user per product

export type WishlistDocument = {
  _id: string;
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
};

export const Wishlist = models.Wishlist ?? model("Wishlist", wishlistSchema);
