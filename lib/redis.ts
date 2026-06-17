import { createClient, RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as { redis: RedisClientType };

let redisClient: RedisClientType;

if (process.env.NODE_ENV === "production") {
  redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });
  redisClient.connect().catch((err) => {
    console.error("Redis production connection error:", err);
  });
} else {
  if (!globalForRedis.redis) {
    globalForRedis.redis = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
    globalForRedis.redis.connect().catch((err) => {
      console.error("Redis development connection error:", err);
    });
  }
  redisClient = globalForRedis.redis;
}

export { redisClient as redis };
