import { Schema, model, models } from "mongoose";

const walletTransactionSchema = new Schema(
  {
    walletId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    userType: { type: String, required: true, enum: ["merchant", "promoter"] },
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: ["CREDIT", "DEBIT"] },
    purpose: { 
      type: String, 
      required: true, 
      enum: ["ORDER_COMMISSION", "WITHDRAWAL", "REFUND", "ADJUSTMENT"] 
    },
    orderId: { type: String, index: true },
    withdrawRequestId: { type: String, index: true },
    status: { type: String, required: true, enum: ["SUCCESS", "PENDING", "FAILED"], default: "SUCCESS" },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ walletId: 1, createdAt: -1 });
walletTransactionSchema.index({ userId: 1, createdAt: -1 });

export type WalletTransactionDocument = {
  walletId: string;
  userId: string;
  userType: "merchant" | "promoter";
  amount: number;
  type: "CREDIT" | "DEBIT";
  purpose: "ORDER_COMMISSION" | "WITHDRAWAL" | "REFUND" | "ADJUSTMENT";
  orderId?: string;
  withdrawRequestId?: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const WalletTransaction = models.WalletTransaction ?? model("WalletTransaction", walletTransactionSchema);
