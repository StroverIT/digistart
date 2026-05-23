import { SignJWT } from "jose";

const REALTIME_TOKEN_TTL_SECONDS = 60 * 60;

export type RealtimeAuthClaims = {
  userId: string;
  role: "customer" | "admin";
};

function getJwtSecret(): Uint8Array {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error("Missing SUPABASE_JWT_SECRET for Supabase Realtime auth.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSupabaseRealtimeToken(
  claims: RealtimeAuthClaims,
): Promise<{ accessToken: string; expiresIn: number }> {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = REALTIME_TOKEN_TTL_SECONDS;

  const accessToken = await new SignJWT({
    role: "authenticated",
    user_id: claims.userId,
    app_role: claims.role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.userId)
    .setIssuedAt(now)
    .setExpirationTime(now + expiresIn)
    .setAudience("authenticated")
    .sign(getJwtSecret());

  return { accessToken, expiresIn };
}
