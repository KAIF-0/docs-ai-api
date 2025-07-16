import { chatRedisClient } from "../configs/redis/chatInstance.js";
import { subRedisClient } from "../configs/redis/subscriptionInstance.js";
import { Queue, Worker } from "bullmq";
import { config } from "dotenv";
import { updateChatCache } from "../helper/updateCache.js";
import { prisma } from "../configs/prisma.js";
import * as cheerio from "cheerio";
import { extractCleanTextFromUrl } from "../helper/cleanHtml.js";

config();

const scrapeQueue = new Queue("scrapeQueue", {
  connection: {
    url: process.env.REDIS_CHAT_INSTANCE_URL,
  },
});

export const scrapeDocumentation = async (key, url, userId, chatId) => {
  const job = await scrapeQueue.getJob(key);
  if (!job) {
    await scrapeQueue.add(
      "scrapeJob",
      { key, url, userId, chatId },
      {
        jobId: key,
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: 5000,
      }
    );
    console.log("Job added successfully!");
  } else {
    console.log("Job already exists!");
  }
};

const worker = new Worker(
  "scrapeQueue",
  async (job) => {
    const { key, url } = job.data;

    try {
      const res = await fetch(url).catch((err) => {
        console.log(`Fetch error for ${url}: `, err);
      });
      const html = await res.text();
      const $ = cheerio.load(html);

      const docLinks = Array.from($("a[href]"))
        .map((el) => $(el).attr("href"))
        .filter((href) => !!href && href.includes("/doc"))
        .map((href) => new URL(href, url).href);

      const docsData = [];

      for (let link of docLinks) {
        try {
          const cleanedText = await extractCleanTextFromUrl(link);
          // console.log(cleanedText);
          docsData.push({ url: link, content: cleanedText });
          console.log(`Scraped with cheerio: ${link}`);
        } catch (err) {
          console.log(`Cheerio load error for ${link}:`, err?.message);
        }
      }

      await chatRedisClient.setEx(
        key,
        30 * 24 * 60 * 60,
        JSON.stringify(docsData)
      );
    } catch (error) {
      console.error(`Error processing job for key ${key}: ${error.message}`);
      throw error;
    }
  },
  {
    connection: {
      url: process.env.REDIS_CHAT_INSTANCE_URL,
    },
    stalledInterval: 10 * 60 * 1000,
  }
);

worker.on("completed", async (job) => {
  const { key, userId, chatId } = job.data;
  console.log(`Job ${job?.id} completed successfully`);

  try {
    await prisma.chat.update({
      where: { id: chatId },
      data: { isActive: true },
    });

    await updateChatCache(userId);

    console.log(`Database updated and cache refreshed!`);
  } catch (error) {
    console.error(error.message);
  }
});

worker.on("failed", async (job, err) => {
  console.log(`Job ${job?.id} failed with error: ${err?.message}`);
});
