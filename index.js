import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { ENV } from "./config/env.js";
import { RedisConnectionManager } from "./config/redisManager.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import chatRouter from "./routes/chatRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import scrapingRouter from "./routes/scrapingRoutes.js";
import "./jobs/workers/scrapeWorker.js";

const app = new Hono();
const port = ENV.PORT;

app.use("*", logger());
app.use(
  cors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
  })
);

await RedisConnectionManager.connectAll();

app.route("/chat", chatRouter);
app.route("/", scrapingRouter);
app.route("/subscription", paymentRouter);

app.get("/health", (c) => {
  return c.json({ status: "OK", message: "Server is healthy!" });
});

app.get("/", (c) => {
  return c.text("Hello from DocsAI Server!");
});

//for error 500 (middleware)
app.onError(errorHandler);

//for 404 (middleware)
app.notFound(notFoundHandler);

serve(
  {
    fetch: app.fetch,
    port: port,
  },
  () => {
    console.log(`Server is running on port ${port}`);
  }
);