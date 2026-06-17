import { redis } from "../redis";
import { RateLimitResult } from "./types";

const AUTH_LIMIT_CAPACITY = 15;
const AUTH_LIMIT_REFILL_RATE = 15 / 60;

const TOKEN_BUCKET_LUA = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local cost = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(data[1])
local last_refill = tonumber(data[2])

if not tokens then
    tokens = capacity
    last_refill = now
else
    local elapsed = math.max(0, now - last_refill)
    local refilled = elapsed * refill_rate
    tokens = math.min(capacity, tokens + refilled)
end

local allowed = false
local retry_after = 0

if tokens >= cost then
    tokens = tokens - cost
    last_refill = now
    allowed = true
    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)
    redis.call('EXPIRE', key, 3600) -- Clean up key if idle for 1 hour
else
    allowed = false
    local needed = cost - tokens
    retry_after = math.ceil(needed / refill_rate)
end

return {allowed and 1 or 0, math.floor(tokens), retry_after}
`;

export async function checkAuthRateLimit(ip: string): Promise<RateLimitResult> {
  const key = `rate_limit:auth:${ip}`;
  const now = Math.floor(Date.now() / 1000);
  const cost = 1;

  try {
    const rawResult = await redis.eval(TOKEN_BUCKET_LUA, {
      keys: [key],
      arguments: [
        AUTH_LIMIT_CAPACITY.toString(),
        AUTH_LIMIT_REFILL_RATE.toString(),
        now.toString(),
        cost.toString(),
      ],
    });

    const [allowedVal, remaining, retryAfter] = rawResult as [number, number, number];

    const allowed = allowedVal === 1;

    return {
      allowed,
      limit: AUTH_LIMIT_CAPACITY,
      remaining: Math.max(0, remaining),
      retryAfter: allowed ? undefined : retryAfter,
    };
  } catch (err) {
    console.error("Auth rate limit evaluation error, failing open to prevent locking out users:", err);
    return {
      allowed: true,
      limit: AUTH_LIMIT_CAPACITY,
      remaining: AUTH_LIMIT_CAPACITY,
    };
  }
}
