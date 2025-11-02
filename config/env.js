import { config } from "dotenv";

config();

export const ENV = {
  PORT: process.env.PORT,
  FRONTEND_URL: process.env.FRONTEND_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_CHAT_INSTANCE_URL: process.env.REDIS_CHAT_INSTANCE_URL,
  REDIS_SUBSCRIPTIONS_INSTANCE_URL: process.env.REDIS_SUBSCRIPTIONS_INSTANCE_URL,
  GENERATIVE_AI_API_KEY: process.env.GENERATIVE_AI_API_KEY,
  RAZORPAY_ID_KEY: process.env.RAZORPAY_ID_KEY,
  RAZORPAY_SECRET_KEY: process.env.RAZORPAY_SECRET_KEY,
  RAG_SERVER_URL: process.env.RAG_SERVER_URL,
  ARCJET_KEY: process.env.ARCJET_KEY,
  ARCJET_ENV: process.env.ARCJET_ENV || "production",
};