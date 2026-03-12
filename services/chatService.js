import { chatRedisClient } from "../config/redis.js";
import { ChatRepository } from "../database/repositories.js";

const chatRepo = new ChatRepository();

export class ChatService {
  async getOrSetUserChats(userId) {
    return new Promise(async (resolve, reject) => {
      const cacheData = await chatRedisClient.get(userId);
      if (cacheData) return resolve(JSON.parse(cacheData));

      //if not found in cache
      const freshData = await chatRepo.findManyByUserId(userId);
      if (!freshData) return resolve(null);
      // console.log("User Chats: ", freshData);

      //cache fresh data
      chatRedisClient.set(userId, JSON.stringify(freshData));
      return resolve(freshData);
    });
  }

  async getDocsData(key) {
    let docsData = await chatRedisClient.get(key);
    return docsData ? JSON.parse(docsData) : [];
  }
}