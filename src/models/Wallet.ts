import { Schema, model, models } from "mongoose";

const walletSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    userType: { type: String, required: true, enum: ["merchant", "promoter"] },
    currentBalance: { type: Number, required: true, default: 0, min: 0 },
    totalEarned: { type: Number, required: true, default: 0, min: 0 },
    totalWithdrawn: { type: Number, required: true, default: 0, min: 0 },
    lockedBalance: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

walletSchema.index({ userId: 1, userType: 1 }, { unique: true });

export type WalletDocument = {
  userId: string;
  userType: "merchant" | "promoter";
  currentBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  lockedBalance: number;
  createdAt: Date;
  updatedAt: Date;
};

export const Wallet = models.Wallet ?? model("Wallet", walletSchema);
