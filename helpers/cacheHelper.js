import { chatRedisClient } from "../config/redis.js";
import { ChatRepository } from "../database/repositories.js";

const chatRepo = new ChatRepository();

export const updateChatCache = async (userId) => {
  const userChats = await chatRepo.findManyByUserId(userId);
  await chatRedisClient.set(userId, JSON.stringify(userChats));
};