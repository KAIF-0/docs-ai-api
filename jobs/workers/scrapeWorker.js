import { Worker } from "bullmq";
import * as cheerio from "cheerio";
import axios from "axios";
import { ENV } from "../../config/env.js";
import { chatRedisClient } from "../../config/redis.js";
import { extractCleanTextFromUrl } from "../../utils/htmlCleaner.js";
import { updateChatCache } from "../../helpers/cacheHelper.js";
import { ChatRepository } from "../../database/repositories.js";

const chatRepo = new ChatRepository();

const worker = new Worker(
  "scrapeQueue",
  async (job) => {
    const { key, url, userId, chatId } = job.data;

    try {
      const res = await fetch(url).catch((err) => {
        console.log(`Fetch error for ${url}: `, err);
      });
      const html = await res.text();
      const $ = cheerio.load(html);

      const docLinks = Array.from($("a[href]"))
        .map((el) => $(el).attr("href"))
        .map((href) => new URL(href, url).href)
        .filter((href) => !!href && href.includes("docs"));

      const docsData = [];

      for (let link of docLinks) {
        try {
          const cleanedText = await extractCleanTextFromUrl(link);
          docsData.push({ url: link, content: cleanedText });
          console.log(`Scraped with cheerio: ${link}`);
        } catch (err) {
          console.log(`Cheerio load error for ${link}:`, err?.message);
        }
      }

      await chatRedisClient.setEx(
        key,
        7 * 24 * 60 * 60,
        JSON.stringify(docsData)
      );

      const { data } = await axios.post(`${ENV.RAG_SERVER_URL}/feedDocs`, {
        key,
      });
      console.log(data);

      await Promise.all([
        chatRepo.updateById(chatId, { isActive: true }),
        updateChatCache(userId),
      ]);
    } catch (error) {
      console.error(`Error processing job for key ${key}: ${error.message}`);
      throw error;
    }
  },
  {
    connection: {
      url: ENV.REDIS_CHAT_INSTANCE_URL,
    },
    lockDuration: 60 * 10 * 1000,
    stalledInterval: 60 * 10 * 1000,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job?.id} completed successfully`);
});

worker.on("failed", async (job, err) => {
  console.log(`Job ${job?.id} failed with error: ${err?.message}`);
});

export { worker };
