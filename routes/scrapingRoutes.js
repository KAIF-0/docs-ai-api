import { Hono } from "hono";
import { ScrapingController } from "../controllers/scrapingController.js";
import { strictRateLimit } from "../middleware/rateLimitMiddleware.js";

const scrapingRouter = new Hono();
const scrapingController = new ScrapingController();

scrapingRouter.get("/scrap", strictRateLimit, (c) => scrapingController.scrapeDocumentation(c));

export default scrapingRouter;