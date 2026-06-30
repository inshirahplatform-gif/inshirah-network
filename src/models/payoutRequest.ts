import { Schema, model, models, Types } from "mongoose";

const payoutRequestSchema = new Schema(
  {
    promoterId: {
      type: Schema.Types.ObjectId,
      ref: "Promoter",
      required: true,
    },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["bKash", "Nagad", "Bank"],
    },
    accountDetails: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    requestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export type PayoutRequestDocument = {
  promoterId: Types.ObjectId;
  amount: number;
  paymentMethod: "bKash" | "Nagad" | "Bank";
  accountDetails: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedAt: Date;
};

export const PayoutRequest =
  models.PayoutRequest ?? model("PayoutRequest", payoutRequestSchema);
