import { prisma } from "../configs/prisma.js";
import { chatRedisClient } from "../configs/redis/chatInstance.js";

export const getOrSetUserChats = async (key) => {
  return new Promise(async (resolve, reject) => {
    const cacheData = await chatRedisClient.get(key);
    if (cacheData) return resolve(JSON.parse(cacheData));

    //if not found in cache
    const freshData = await prisma.chat.findMany({
      where: { userId: key },
      include: {
        messages: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!freshData) return resolve(null);
    console.log("User Chats: ", freshData);

    //cache fresh data
    chatRedisClient.set(key, JSON.stringify(freshData));
    return resolve(freshData);
  });
};
