import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { Schema, model, models } from "mongoose";

const promoterSchema = new Schema(
  {
    fullName:         { type: String,  required: true,  trim: true },
    email:            { type: String,  required: true,  unique: true, lowercase: true, trim: true },
    whatsapp:         { type: String,  required: true,  trim: true },
    passwordHash:     { type: String,  required: true },
    agreedToShariah:  { type: Boolean, required: true,  default: false },
    role:             { type: String,  required: true,  default: "promoter" },

    // ── Balance ledger ─────────────────────────────────────────────────────
    /** Lifetime confirmed earnings (updated on escrow release, not on delivery) */
    totalEarned:      { type: Number,  required: true,  default: 0 },
    /** Commission reserved at order creation, waiting for delivery */
    pendingBalance:   { type: Number,  required: true,  default: 0 },
    /** Commission locked during the 7-day return window after delivery */
    holdBalance:      { type: Number,  required: true,  default: 0 },
    /** Commission cleared and ready to withdraw (post return-window) */
    availableBalance: { type: Number,  required: true,  default: 0 },
  },
  { timestamps: true },
);

export type PromoterDocument = {
  fullName:         string;
  email:            string;
  whatsapp:         string;
  passwordHash:     string;
  agreedToShariah:  boolean;
  role:             "promoter";
  totalEarned:      number;
  pendingBalance:   number;
  holdBalance:      number;
  availableBalance: number;
};

export const Promoter = models.Promoter ?? model("Promoter", promoterSchema);

// ── Password utilities ────────────────────────────────────────────────────────

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const incomingHash  = scryptSync(password, salt, 64);
  const expectedHash  = Buffer.from(hash, "hex");

  return (
    incomingHash.length === expectedHash.length &&
    timingSafeEqual(incomingHash, expectedHash)
  );
}

export function normalizeWhatsappNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^01\d{9}$/.test(digits))   return `880${digits.slice(1)}`;
  if (/^8801\d{9}$/.test(digits)) return digits;
  return null;
}
