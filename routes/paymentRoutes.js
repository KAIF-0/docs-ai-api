import { Hono } from "hono";
import { PaymentController } from "../controllers/paymentController.js";

const paymentRouter = new Hono();
const paymentController = new PaymentController();

paymentRouter.post("/createOrder", (c) => paymentController.createOrder(c));
paymentRouter.post("/saveDetails", (c) => paymentController.saveDetails(c));
paymentRouter.get("/getDetails/:userId", (c) => paymentController.getDetails(c));

export default paymentRouter;