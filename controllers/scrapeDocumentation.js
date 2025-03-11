import puppeteer from "puppeteer-core";
import { chatRedisClient } from "../configs/redis/chatInstance.js";
import { subRedisClient } from "../configs/redis/subscriptionInstance.js";
import chromium from "chromium";
import { Queue, Worker } from "bullmq";
import { config } from "dotenv";

config();

const scrapeQueue = new Queue("scrapeQueue", {
  connection: {
    url: process.env.REDIS_CHAT_INSTANCE_URL,
  },
});

export const scrapeDocumentation = async (key, url) => {
  const job = await scrapeQueue.getJob(key);
  if (!job) {
    await scrapeQueue.add("scrapeJob", { key, url }, { jobId: key });
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
        executablePath: chromium.path,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "load", timeout: 0 });

      const docLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a[href]"))
          .map((link) => link.href)
          .filter((href) => href.includes("/docs"));
      });

      let docsData = [];

      for (let pageLink of docLinks) {
        await page.goto(pageLink, { waitUntil: "load", timeout: 0 });
        console.log(`Scraping: ${pageLink}`);

        const content = await page.evaluate(() => document.body.innerText);
        docsData.push({ url: pageLink, content });
      }

      await chatRedisClient.setEx(
        key,
        30 * 24 * 60 * 60,
        JSON.stringify(docsData)
      );

      await browser.close();
    } catch (error) {
      console.error(`Error processing job for key ${key}: ${error.message}`);
    }
  },
  {
    connection: {
      url: process.env.REDIS_CHAT_INSTANCE_URL,
    },
    concurrency: 10,
  }
);

worker.on("completed", async (job) => {
  console.log(`Job ${job.id} completed successfully`);
  await job.remove();
});

worker.on("failed", async (job, err) => {
  console.log(`Job ${job.id} failed with error: ${err.message}`);
  await job.remove();
});
