import { SubscriptionRepository } from "../database/repositories.js";
import { SubscriptionService } from "../services/subscriptionService.js";
import { PaymentService } from "../services/paymentService.js";
import { subRedisClient } from "../config/redis.js";
import { SubscriptionType } from "@prisma/client";
import { calculateSubscriptionEndDate, getExpiryTime } from "../utils/common.js";

const subscriptionRepo = new SubscriptionRepository();
const subscriptionService = new SubscriptionService();
const paymentService = new PaymentService();

export class PaymentController {
  async createOrder(c) {
    try {
      const requestData = await c.req.json();
      const { amount, name, email, phone, subscriptionType, userId } = requestData;

      if (!amount || !name || !email || !phone || !subscriptionType || !userId) {
        throw new Error("Missing required fields");
      }

      const options = { amount, name, email, phone, subscriptionType, userId };
      const data = await paymentService.createOrder(options);
      if (!data?.success) {
        throw new Error("Failed to create order!");
      }

      return c.json(data);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async saveDetails(c) {
    try {
      const {
        userId,
        username,
        email,
        phone,
        amount,
        orderId,
        subscriptionType,
      } = await c.req.json();

      //setting start date and end date
      const { startDate, endDate } = calculateSubscriptionEndDate(subscriptionType);

      const subscriptionDetails = await subscriptionRepo.create({
        userId,
        username,
        email,
        phone,
        amount: parseInt(amount),
        orderId,
        subscriptionType:
          subscriptionType === "monthly"
            ? SubscriptionType.monthly
            : SubscriptionType.annually,
        startDate,
        endDate,
      });

      //caching subscription details
      const expiryTime = getExpiryTime(subscriptionDetails.subscriptionType);
      await subRedisClient.setEx(
        userId,
        expiryTime,
        JSON.stringify(subscriptionDetails)
      );

      return c.json({
        success: true,
        msg: "Payment Details Saved Successfully!",
        subscriptionDetails,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getDetails(c) {
    try {
      const userId = c.req.param("userId");
      if (userId === "null") {
        throw new Error("Invalid userId!");
      }

      //get subscription details from cache or from db
      const subscriptionDetails = await subscriptionService.getOrSetSubscriptionDetails(userId);
      if (!subscriptionDetails) {
        c.set("message", "No active subscription found!"); //set response message
        return c.notFound();
      }

      return c.json({
        success: true,
        subscriptionDetails: subscriptionDetails,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}