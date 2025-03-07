import { prisma } from "../configs/prisma.js";
import { chatRedisClient } from "../configs/redis/chatInstance.js";

export const updateChatCache = async (key) => {
  const userChats = await prisma.chat.findMany({
    where: { userId: key },
    include: {
      messages: true,
    },
  });
  await chatRedisClient.set(key, JSON.stringify(userChats));
};
