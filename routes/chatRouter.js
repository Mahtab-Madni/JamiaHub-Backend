import { Router } from "express";
import { protectRoute } from "../middleware/authmiddleware.js";
import { getStreamToken } from "../controller/chatController.js";
const chatRouter = Router();

chatRouter.get("/token",protectRoute, getStreamToken);

export default chatRouter;  