import Razorpay from "razorpay";
import { ENV } from "./env.js";

export const razorpayInstance = new Razorpay({
  key_id: ENV.RAZORPAY_ID_KEY,
  key_secret: ENV.RAZORPAY_SECRET_KEY,
});