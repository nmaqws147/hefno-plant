import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_URL,
  token: process.env.UPSTASH_TOKEN,
});

export async function checkRateLimit(fingerprint, limit = 5) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `limit:${fingerprint}:${today}`;

  const count = (await redis.get(key)) || 0;

  if (count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      reset: 86400,
    };
  }

  await redis.incr(key);
  await redis.expire(key, 86400);

  return {
    allowed: true,
    remaining: limit - count - 1,
    reset: 86400,
  };
}