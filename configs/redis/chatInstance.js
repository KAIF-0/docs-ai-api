import redis from "redis";
import { config } from "dotenv";

config();
export const chatRedisClient = redis.createClient({
  url: process.env.REDIS_CHAT_INSTANCE_URL,
  password: process.env.REDIS_CHAT_INSTANCE_PASSWORD,
});
