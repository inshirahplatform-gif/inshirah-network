/**
 * Secure session helpers using HMAC-signed JWTs (jose).
 *
 * The cookie value is a compact JWS (HS256) — payload is signed but NOT
 * encrypted.  Sensitive fields (passwordHash etc.) must never be put in here.
 * The secret comes from SESSION_SECRET env var; minimum 32 chars recommended.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export type SessionRole = "promoter" | "merchant" | "admin";

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role: SessionRole;
  name: string;
}

const COOKIE_NAME = "inshirah_session";
const ALGORITHM = "HS256";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Returns the raw secret bytes.  Throws if SESSION_SECRET is missing so the
 * app fails fast at startup rather than silently using a weak key.
 */
function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET env variable is missing or too short (minimum 32 characters)."
    );
  }
  return new TextEncoder().encode(secret);
}

/** Sign a session payload and return a compact JWT string. */
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

/** Verify and decode the session cookie value.  Returns null on any failure. */
export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [ALGORITHM],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME, SESSION_TTL_SECONDS };
