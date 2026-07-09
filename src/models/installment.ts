import mongoose, { Schema, Types } from "mongoose";

export const installmentSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  downPayment: {
    type: Number,
    required: true,
  },
  installmentAmount: {
    type: Number,
    required: true,
  },
  installmentCount: {
    type: Number,
    required: true,
  },
  installmentPeriod: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["murabaha", "ijara"],
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  },
  paidInstallments: {
    type: Number,
    default: 0,
  },
  nextDueDate: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

installmentSchema.index({ orderId: 1 });
installmentSchema.index({ userId: 1, status: 1 });

export type InstallmentDocument = {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  userId?: Types.ObjectId;
  totalAmount: number;
  downPayment: number;
  installmentAmount: number;
  installmentCount: number;
  installmentPeriod: number;
  type: "murabaha" | "ijara";
  status: "active" | "completed" | "cancelled";
  paidInstallments: number;
  nextDueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
};

export default mongoose.models.Installment ||
  mongoose.model("Installment", installmentSchema);
