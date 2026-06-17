import { redis } from "../redis";
import { prisma } from "../prisma";
import { RateLimitResult } from "./types";

const FREE_LIMIT = 10;
const PRO_LIMIT = 30;

const FIXED_WINDOW_LUA = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])

local current = redis.call('GET', key)
if current and tonumber(current) >= limit then
    return {0, tonumber(current)}
else
    local val = redis.call('INCR', key)
    if val == 1 then
        redis.call('EXPIRE', key, ttl)
    end
    return {1, val}
end
`;

export async function checkChatRateLimit(userId: string): Promise<RateLimitResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true },
    });

    const isPro = user?.subscriptionStatus === "active";
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(now.getUTCDate()).padStart(2, "0");

    let limit: number;
    let ttl: number;
    let resetAt: string;
    let key: string;
    let upgradeAvailable: boolean;

    if (isPro) {
      const hh = String(now.getUTCHours()).padStart(2, "0");
      const hourStr = `${yyyy}-${mm}-${dd}-${hh}`;
      key = `rate_limit:chat:pro:${userId}:${hourStr}`;
      limit = PRO_LIMIT;
      upgradeAvailable = false;

      const nextHour = new Date(Date.UTC(yyyy, now.getUTCMonth(), now.getUTCDate(), now.getUTCHours() + 1, 0, 0, 0));
      ttl = Math.max(1, Math.ceil((nextHour.getTime() - now.getTime()) / 1000));
      resetAt = nextHour.toISOString();
    } else {
      const dateStr = `${yyyy}-${mm}-${dd}`;
      key = `rate_limit:chat:free:${userId}:${dateStr}`;
      limit = FREE_LIMIT;
      upgradeAvailable = true;

      const nextDay = new Date(Date.UTC(yyyy, now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
      ttl = Math.max(1, Math.ceil((nextDay.getTime() - now.getTime()) / 1000));
      resetAt = nextDay.toISOString();
    }

    const rawResult = await redis.eval(FIXED_WINDOW_LUA, {
      keys: [key],
      arguments: [limit.toString(), ttl.toString()],
    });

    const [allowedVal, count] = rawResult as [number, number];
    const allowed = allowedVal === 1;

    return {
      allowed,
      limit,
      remaining: Math.max(0, limit - count),
      resetAt,
      upgradeAvailable,
    };
  } catch (err) {
    console.error("Chat rate limit evaluation error, failing open to prevent disabling chatbot:", err);
    return {
      allowed: true,
      limit: FREE_LIMIT,
      remaining: FREE_LIMIT,
      resetAt: new Date().toISOString(),
      upgradeAvailable: true,
    };
  }
}
