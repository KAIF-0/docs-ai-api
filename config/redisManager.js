import { chatRedisClient, subRedisClient } from "../config/redis.js";

export class RedisConnectionManager {
  static async connectAll() {
    //redis instance(subscription Instance)
    await subRedisClient
      .connect()
      .then(() => {
        console.log("SUBSCRIPTIONS REDIS INSTANCE CONNECTED!");
      })
      .catch((err) => {
        console.log("SUBSCRIPTIONS REDIS ERROR: ", err);
      });

    await chatRedisClient
      .connect()
      .then(() => {
        console.log("CHAT REDIS INSTANCE CONNECTED!");
      })
      .catch((err) => {
        console.log("CHAT REDIS ERROR: ", err);
      });

    this.setupErrorHandlers();
  }

  static setupErrorHandlers() {
    //redis error events
    subRedisClient.on("error", async (err) => {
      console.error("SUBSCRIPTIONS REDIS ERROR:", err);

      //disconnect first before reconnecting
      try {
        await subRedisClient.disconnect();
      } catch (disconnectErr) {
        console.error("Error during disconnect:", disconnectErr);
      }

      //adding a delay
      setTimeout(async () => {
        try {
          await subRedisClient.connect();
          console.log("SUBSCRIPTIONS REDIS RECONNECTED");
        } catch (reconnectErr) {
          console.error("Failed to reconnect:", reconnectErr);
        }
      }, 1000);
    });

    chatRedisClient.on("error", async (err) => {
      console.error("CHAT REDIS ERROR:", err);

      //disconnect first before reconnecting
      try {
        await chatRedisClient.disconnect();
      } catch (disconnectErr) {
        console.error("Error during disconnect:", disconnectErr);
      }

      //adding a delay
      setTimeout(async () => {
        try {
          await chatRedisClient.connect();
          console.log("CHAT REDIS RECONNECTED");
        } catch (reconnectErr) {
          console.error("Failed to reconnect:", reconnectErr);
        }
      }, 1000);
    });
  }
}