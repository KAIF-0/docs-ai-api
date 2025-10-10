import { subRedisClient } from "../config/redis.js";
import { SubscriptionRepository } from "../database/repositories.js";
import { getExpiryTime } from "../utils/common.js";

const subscriptionRepo = new SubscriptionRepository();

export class SubscriptionService {
  async getOrSetSubscriptionDetails(userId) {
    return new Promise(async (resolve, reject) => {
      const cacheData = await subRedisClient.get(userId);
      if (cacheData) return resolve(JSON.parse(cacheData));

      //if not found in cache
      const freshData = await subscriptionRepo.findUnique({
        userId,
      });
      if (!freshData && new Date(freshData?.endDate) < new Date()) {
        //subscription expired
        return resolve(null);
      }
      // console.log("Subscription Details: ", freshData);
      //set expiry time
      const expiryTime = getExpiryTime(freshData?.subscriptionType);
      subRedisClient.setEx(userId, expiryTime, JSON.stringify(freshData));
      return resolve(freshData);
    });
  }
}
