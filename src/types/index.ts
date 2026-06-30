export type UserRole = "promoter" | "merchant" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromoterProfile {
  userId: string;
  referralCode: string;
  totalEarnings: number;
}

export interface MerchantProfile {
  userId: string;
  businessName: string;
  isVerified: boolean;
}

export interface AdminProfile {
  userId: string;
  permissions: string[];
}
