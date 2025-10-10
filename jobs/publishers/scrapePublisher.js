import { Queue } from "bullmq";
import { ENV } from "../../config/env.js";

const scrapeQueue = new Queue("scrapeQueue", {
  connection: {
    url: ENV.REDIS_CHAT_INSTANCE_URL,
  },
});

export const publishScrapeJob = async (key, url, userId, chatId) => {
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