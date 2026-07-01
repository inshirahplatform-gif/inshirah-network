import { Schema, model, models } from "mongoose";

const merchantSchema = new Schema(
  {
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

export type MerchantDocument = {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  passwordHash: string;
  isVerified: boolean;
};

export const Merchant = models.Merchant ?? model("Merchant", merchantSchema);
