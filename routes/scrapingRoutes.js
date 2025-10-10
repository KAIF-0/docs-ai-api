import { Hono } from "hono";
import { ScrapingController } from "../controllers/scrapingController.js";

const scrapingRouter = new Hono();
const scrapingController = new ScrapingController();


//for testing
scrapingRouter.get("/scrap", (c) => scrapingController.scrapeDocumentation(c));

export default scrapingRouter;