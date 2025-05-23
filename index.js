import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config } from "dotenv";
import scrappingInstance from "./routes/srapping-route.js";
import chatInstance from "./routes/chat-routes.js";
import paymentInstance from "./routes/payment-routes.js";
import { subRedisClient } from "./configs/redis/subscriptionInstance.js";
import { chatRedisClient } from "./configs/redis/chatInstance.js";

config();
const app = new Hono();
const port = process.env.PORT;

// console.log(process.env.REDIS_CHAT_INSTANCE_URL, port);

app.use("*", logger());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

//redis instance(subscription Instance)
await subRedisClient
  .connect()
  .then(() => {
    console.log("SUBSCRIPTIONS REDIS INSTANCE CONNECTED!");
  })
  .catch((err) => {
    console.log("SUBSCRIPTIONS REDIS ERROR: ", err);
  });

await chatRedisClient
  .connect()
  .then(() => {
    console.log("CHAT REDIS INSTANCE CONNECTED!"); 
  })
  .catch((err) => {
    console.log("CHAT REDIS ERROR: ", err); 
  });

//redis error events
subRedisClient.on("error", async (err) => {
  console.error("SUBSCRIPTIONS REDIS ERROR:", err);

  //disconnect first before reconnecting
  try {
    await subRedisClient.disconnect();
  } catch (disconnectErr) {
    console.error("Error during disconnect:", disconnectErr);
  }

  //adding a delay
  setTimeout(async () => {
    try {
      await subRedisClient.connect();
      console.log("SUBSCRIPTIONS REDIS RECONNECTED");
    } catch (reconnectErr) {
      console.error("Failed to reconnect:", reconnectErr);
    }
  }, 1000);
});

chatRedisClient.on("error", async (err) => {
  console.error("CHAT REDIS ERROR:", err);

  //disconnect first before reconnecting
  try {
    await chatRedisClient.disconnect();
  } catch (disconnectErr) {
    console.error("Error during disconnect:", disconnectErr);
  }

  //sdding a delay
  setTimeout(async () => {
    try {
      await chatRedisClient.connect();
      console.log("CHAT REDIS RECONNECTED");
    } catch (reconnectErr) {
      console.error("Failed to reconnect:", reconnectErr);
    }
  }, 1000);
});

app.route("/chat", chatInstance);
app.route("/", scrappingInstance);
app.route("/subscription", paymentInstance);

app.get('/', (c) => {
  return c.text('Hello fron DocsAI Server!')
})

//for error 500 (middleware)
app.onError((err, c) => {
  console.error(err.message);
  return c.json( 
    {
      success: false,
      message: "Internal Server Error!",
    },
    500
  );
});

//for 404 (middleware)
app.notFound((c) => {
  console.error(c.get("message"));
  return c.json(
    {
      success: false,
      message: c.get("message"),
    },
    404
  );
});

serve(
  {
    fetch: app.fetch,
    port: port,
  },
  () => {
    console.log(`Server is running on port ${port}`);
  }
);
