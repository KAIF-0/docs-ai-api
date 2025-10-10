import { Hono } from "hono";
import { ChatController } from "../controllers/chatController.js";

const chatRouter = new Hono();
const chatController = new ChatController();

chatRouter.post("/feed-docs", (c) => chatController.feedDocs(c));
chatRouter.get("/getUserChats/:userId", (c) => chatController.getUserChats(c));
chatRouter.post("/getResponse/:chatId", (c) => chatController.getResponseFromAI(c));

export default chatRouter;