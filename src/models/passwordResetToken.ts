import { Schema, model, models, Types } from "mongoose";

/**
 * Single-use password reset tokens.
 * TTL index automatically removes expired documents from MongoDB.
 */
const passwordResetTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  role: { type: String, required: true, enum: ["promoter", "merchant"] },
  // unique: true already creates the index — do NOT add schema.index({ token: 1 }) separately
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

// MongoDB TTL index: document is auto-deleted after expiresAt
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type PasswordResetTokenDocument = {
  userId: Types.ObjectId;
  role: "promoter" | "merchant";
  token: string;
  expiresAt: Date;
};

export const PasswordResetToken =
  models.PasswordResetToken ??
  model("PasswordResetToken", passwordResetTokenSchema);
