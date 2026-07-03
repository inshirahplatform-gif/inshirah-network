import { Schema, model, models, Types } from "mongoose";

const orderSchema = new Schema(
  {
    productId: {
      type:     Schema.Types.ObjectId,
      ref:      "Product",
      required: true,
    },
    merchantId: {
      type:     Schema.Types.ObjectId,
      required: true,
    },
    promoterId: {
      type: Schema.Types.ObjectId,
      ref:  "Promoter",
    },

    // ── Customer details ──────────────────────────────────────────────────
    customerName:    { type: String, required: true },
    customerPhone:   { type: String, required: true },
    shippingAddress: { type: String, required: true },

    // ── Merchant pickup details (for courier API) ──────────────────────────
    pickupName:    { type: String, default: "" },
    pickupPhone:   { type: String, default: "" },
    pickupAddress: { type: String, default: "" },

    // ── Financials ────────────────────────────────────────────────────────
    totalAmount:      { type: Number, required: true },
    commissionAmount: { type: Number, default: 0 },

    // ── Status ────────────────────────────────────────────────────────────
    status: {
      type:     String,
      required: true,
      enum:     ["Pending", "Shipped", "Delivered", "Cancelled"],
      default:  "Pending",
    },

    // ── Escrow / commission lifecycle ─────────────────────────────────────
    /**
     * Tracks where the commission is in its lifecycle:
     *  none      — no promoter linked, or order not yet delivered
     *  held      — order delivered; commission locked in 7-day return window
     *  released  — return window passed; promoter's availableBalance credited
     *  cancelled — order cancelled; commission reversed
     */
    commissionStatus: {
      type:    String,
      enum:    ["none", "held", "released", "cancelled"],
      default: "none",
    },
    /**
     * The exact UTC timestamp after which the cron job may release the
     * commission from holdBalance → availableBalance.
     * Set to (deliveredAt + 7 days) when status becomes "Delivered".
     */
    escrowReleaseDate: { type: Date },

    // ── Courier tracking ───────────────────────────────────────────────────
    /** Tracking code returned by Steadfast after a successful booking. */
    courierTrackingId: { type: String, default: "" },
    /** Delivery status string returned by Steadfast (e.g. "in_review"). */
    courierStatus:     { type: String, default: "" },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
orderSchema.index({ merchantId: 1, status: 1 });
orderSchema.index({ promoterId: 1, status: 1 });
orderSchema.index({ productId: 1 });
// Cron job query: find all held commissions past their release date
orderSchema.index({ commissionStatus: 1, escrowReleaseDate: 1 });

// ── TypeScript type ───────────────────────────────────────────────────────────
export type CommissionStatus = "none" | "held" | "released" | "cancelled";

export type OrderDocument = {
  productId:         Types.ObjectId;
  merchantId:        Types.ObjectId;
  promoterId?:       Types.ObjectId;
  customerName:      string;
  customerPhone:     string;
  shippingAddress:   string;
  pickupName:        string;
  pickupPhone:       string;
  pickupAddress:     string;
  totalAmount:       number;
  commissionAmount:  number;
  status:            "Pending" | "Shipped" | "Delivered" | "Cancelled";
  commissionStatus:  CommissionStatus;
  escrowReleaseDate?: Date;
  courierTrackingId: string;
  courierStatus:     string;
  createdAt:         Date;
};

export const Order = models.Order ?? model("Order", orderSchema);
