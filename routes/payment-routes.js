import { Hono } from "hono";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import { createOrder } from "../controllers/payment.js";
import { prisma } from "../configs/prisma.js";
import { SubscriptionType } from "@prisma/client";
import getOrSetSubDetailsCache from "../controllers/subscriptionDetails.js";
import { subRedisClient } from "../configs/redis/subscriptionInstance.js";

dotenv.config();

const paymentInstance = new Hono();

paymentInstance.post("/createOrder", async (c) => {
  try {
    const requestData = await c.req.json();
    const { amount, name, email, phone, subscriptionType, userId } =
      requestData; 

    if (!amount || !name || !email || !phone || !subscriptionType || !userId) {
      throw new Error("Missing required fields");
    }

    const options = { amount, name, email, phone, subscriptionType, userId };
    const data = await createOrder(options);
    if (!data?.success) {
      throw new Error("Failed to create order!");
    }
 


    
    return c.json(data);
  } catch (error) {
    throw new Error(error.message);
  }
});

paymentInstance.post("/saveDetails", async (c) => {
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
    const startDate = new Date();
    const endDate = new Date();
    if (subscriptionType === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscriptionDetails = await prisma.subscription.create({
      data: {
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
      },
    });

    //caching subscription details
    const expiryTime =
      subscriptionDetails.subscriptionType === "monthly"
        ? 30 * 24 * 60 * 60
        : 365 * 24 * 60 * 60;
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
});

paymentInstance.get("/getDetails/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    if (userId === "null") {
      throw new Error("Invalid userId!");
    }

    //get subscription details from cache or from db
    const subscriptionDetails = await getOrSetSubDetailsCache(userId);
    if (!subscriptionDetails) {
      c.set("message", "Subscription not found!"); //set response message
      return c.notFound();
    }
    // console.log(subscriptionDetails);
    return c.json({
      success: true,
      subscriptionDetails: subscriptionDetails,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

export default paymentInstance;
