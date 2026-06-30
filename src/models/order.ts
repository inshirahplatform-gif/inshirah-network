import { Schema, model, models, Types } from "mongoose";

const orderSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    merchantId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    promoterId: {
      type: Schema.Types.ObjectId,
      ref: "Promoter",
    },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    commissionAmount: { type: Number, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export type OrderDocument = {
  productId: Types.ObjectId;
  merchantId: Types.ObjectId;
  promoterId?: Types.ObjectId;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  commissionAmount: number;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: Date;
};

export const Order = models.Order ?? model("Order", orderSchema);
