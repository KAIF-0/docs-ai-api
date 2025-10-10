import redis from "redis";
import { ENV } from "./env.js";

export const chatRedisClient = redis.createClient({
  url: ENV.REDIS_CHAT_INSTANCE_URL,
});

export const subRedisClient = redis.createClient({
  url: ENV.REDIS_SUBSCRIPTIONS_INSTANCE_URL,
});