import { Hono } from "hono";
import { PaymentController } from "../controllers/paymentController.js";
import { paymentRateLimit, standardRateLimit, lenientRateLimit } from "../middleware/rateLimitMiddleware.js";

const paymentRouter = new Hono();
const paymentController = new PaymentController();

paymentRouter.post("/createOrder", paymentRateLimit, (c) => paymentController.createOrder(c));
paymentRouter.post("/saveDetails", standardRateLimit, (c) => paymentController.saveDetails(c));
paymentRouter.get("/getDetails/:userId", lenientRateLimit, (c) => paymentController.getDetails(c));

export default paymentRouter;