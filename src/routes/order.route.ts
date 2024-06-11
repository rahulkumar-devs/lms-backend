
import express from "express";
import { isAuthenticated } from "../middleware/authentication";
import { addOrder } from "../controllers/order/addOrder";

const orderRoute = express.Router();

orderRoute.route("/add-order").post(isAuthenticated,addOrder);

export default orderRoute;