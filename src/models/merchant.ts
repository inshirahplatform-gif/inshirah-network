import { Schema, model, models } from "mongoose";

const merchantSchema = new Schema(
  {
    businessName:       { type: String,  required: true,  trim: true },
    ownerName:          { type: String,  required: true,  trim: true },
    email:              { type: String,  required: true,  unique: true, lowercase: true, trim: true },
    phone:              { type: String,  required: true,  trim: true },
    passwordHash:       { type: String,  required: true },
    isVerified:         { type: Boolean, required: true,  default: false },

    // ── Balance ledger ─────────────────────────────────────────────────────
    /**
     * Net product earnings (totalAmount − commission) credited immediately
     * when an order is marked Delivered. Merchant can request withdrawal any time.
     */
    withdrawableBalance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export type MerchantDocument = {
  businessName:       string;
  ownerName:          string;
  email:              string;
  phone:              string;
  passwordHash:       string;
  isVerified:         boolean;
  withdrawableBalance: number;
};

export const Merchant = models.Merchant ?? model("Merchant", merchantSchema);
