import { publishScrapeJob } from "../jobs/publishers/scrapePublisher.js";

export class ScrapingController {
  async scrapeDocumentation(c) {
    publishScrapeJob("v0", "https://v0.app/docs/introduction", null, null);
    return c.text("Scraping job added!");
  }
}