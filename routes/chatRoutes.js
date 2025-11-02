import { Hono } from "hono";
import { ChatController } from "../controllers/chatController.js";
import { strictRateLimit, moderateRateLimit, lenientRateLimit } from "../middleware/rateLimitMiddleware.js";

const chatRouter = new Hono();
const chatController = new ChatController();

chatRouter.post("/feed-docs", strictRateLimit, (c) => chatController.feedDocs(c));
chatRouter.get("/getUserChats/:userId", lenientRateLimit, (c) => chatController.getUserChats(c));
chatRouter.post("/getResponse/:chatId", strictRateLimit, (c) => chatController.getResponseFromAI(c));

export default chatRouter;