import express from "express";
import { createOrder, getOrders } from "../controllers/orderController.js";

const router = express.Router();

router.get("/getOrder", getOrders);
router.post("/createOrder", createOrder);

export default router;