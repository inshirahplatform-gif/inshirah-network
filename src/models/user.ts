import type { User } from "@/types";

export const USERS_COLLECTION = "users";

export type UserDocument = User;

export const userIndexes = [{ key: { email: 1 }, unique: true }] as const;
