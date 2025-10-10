import { ChatRepository, MessageRepository } from "../database/repositories.js";
import { ChatService } from "../services/chatService.js";
import { publishScrapeJob } from "../jobs/publishers/scrapePublisher.js";
import { updateChatCache } from "../helpers/cacheHelper.js";
import { getResponse } from "../helpers/ragHelper.js";
import { extractUrlKey } from "../utils/common.js";
import { chatRedisClient } from "../config/redis.js";

const chatRepo = new ChatRepository();
const messageRepo = new MessageRepository();
const chatService = new ChatService();

export class ChatController {
  async feedDocs(c) {
    try {
      const { userId, url } = await c.req.json();

      //extracting a common key for all same urls with different endpoints
      const key = extractUrlKey(url);
      console.log(key);

      let chat;

      const existingDocs = await chatRedisClient.get(key);
      if (!existingDocs) {
        chat = await chatRepo.create({
          userId,
          url,
          key,
        });
        //add a scraping job if not found in redis
        await publishScrapeJob(key, url, userId, chat.id).catch((err) =>
          console.log(err)
        );
      } else {
        chat = await chatRepo.create({
          userId,
          url,
          key,
          isActive: true,
        });
      }

      //update cache
      await updateChatCache(userId).catch((err) => console.log(err));
      return c.json({
        success: true,
        message: "Docs saved successfully!",
        chat,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getUserChats(c) {
    try {
      const userId = c.req.param("userId");
      if (userId === "null") {
        throw new Error("Invalid userId!");
      }
      const chats = await chatService.getOrSetUserChats(userId);
  
      if (!chats) {
        c.set("message", "No chats found!");
        return c.notFound();
      }

      return c.json({
        success: true,
        message: "All chats retrieved successfully!",
        chats,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getResponseFromAI(c) {
    try {
      const { question, userId, key, url } = await c.req.json();
      const chatId = c.req.param("chatId");

      if (!chatId) {
        throw new Error("Invalid chatId!");
      }

      const response = await getResponse(question, key, url);

      const chatMessage = await messageRepo.create({
        chat: {
          connect: { id: chatId },
        },
        userId,
        question: question,
        response: response,
      });

      //updating cached messages
      await updateChatCache(userId).catch((err) => console.log(err));
      return c.json({
        success: true,
        message: "AI response created successfully!",
        chatMessage,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}