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
  { timestamps: true }
);

// Admin payout queue: filter pending requests per promoter
payoutRequestSchema.index({ promoterId: 1, status: 1 });
// Admin dashboard: all pending requests sorted by request date
payoutRequestSchema.index({ status: 1, requestedAt: -1 });

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
