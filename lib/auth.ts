import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";


if (!process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is not set");
}
const JWT_SECRET = process.env.JWT_SECRET!;;

export function signToken(payload: { userId: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
    algorithm: "HS256"
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"]
    }) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const lower = authHeader.toLowerCase();
    if (lower.startsWith("bearer ")) {
      return authHeader.slice(7).trim();
    }
  }
  const cookie = req.cookies.get("token");
  return cookie?.value || null;
}

export function getUserFromRequest(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function hasProAccess(user: {
  subscriptionStatus?: string | null;
  currentPeriodEnd?: Date | string | null;
}): boolean {
  if (!user.subscriptionStatus) return false;
  if (!["active", "trialing"].includes(user.subscriptionStatus)) return false;
  if (!user.currentPeriodEnd) return false;

  const expiry = typeof user.currentPeriodEnd === "string"
    ? new Date(user.currentPeriodEnd)
    : user.currentPeriodEnd;

  return expiry.getTime() > Date.now();
}
