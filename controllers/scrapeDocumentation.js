import puppeteer from "puppeteer";
import { chatRedisClient } from "../configs/redis/chatInstance.js";
import { subRedisClient } from "../configs/redis/subscriptionInstance.js";
import { Queue, Worker } from "bullmq";
import { config } from "dotenv";
import { updateChatCache } from "../helper/updateCache.js";
import { prisma } from "../configs/prisma.js";

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
      const browser = await puppeteer.launch({
        executablePath: "/usr/bin/chromium-browser",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        protocolTimeout: 300000,
      });

      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });

      const docLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a[href]"))
          .map((link) => link.href)
          .filter((href) => href.includes("docs"));
      });

      let docsData = [];

      for (let pageLink of docLinks) {
        await page
          .goto(pageLink, {
            waitUntil: "domcontentloaded",
            timeout: 5 * 60 * 1000,
          })
          .then(async () => {
            console.log(`Scraping: ${pageLink}`);

            const content = await page.evaluate(() => document.body.innerText);
            docsData.push({ url: pageLink, content });
          })
          .catch((err) => {
            console.log("Goto Error: ", err);
          });
      }

      await chatRedisClient.setEx(
        key,
        30 * 24 * 60 * 60,
        JSON.stringify(docsData)
      );

      await browser.close();
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
