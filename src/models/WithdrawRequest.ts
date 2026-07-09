import { Schema, model, models } from "mongoose";

const withdrawRequestSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    userType: { type: String, required: true, enum: ["merchant", "promoter"] },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true, enum: ["bKash", "Nagad", "Bank"] },
    accountDetails: { type: String, required: true },
    status: { 
      type: String, 
      required: true, 
      enum: ["PENDING", "APPROVED", "REJECTED", "PROCESSING"], 
      default: "PENDING" 
    },
    rejectionReason: { type: String },
    processedAt: { type: Date },
    processedBy: { type: String }, // Admin userId
  },
  { timestamps: true }
);

withdrawRequestSchema.index({ userId: 1, createdAt: -1 });
withdrawRequestSchema.index({ status: 1, createdAt: -1 });

export type WithdrawRequestDocument = {
  userId: string;
  userType: "merchant" | "promoter";
  amount: number;
  paymentMethod: "bKash" | "Nagad" | "Bank";
  accountDetails: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSING";
  rejectionReason?: string;
  processedAt?: Date;
  processedBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const WithdrawRequest = models.WithdrawRequest ?? model("WithdrawRequest", withdrawRequestSchema);
