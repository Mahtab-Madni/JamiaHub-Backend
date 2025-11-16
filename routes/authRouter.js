import { Router } from "express";
import { login, signup, logout, onboard } from "../controller/authcontroller.js";
import { protectRoute } from "../middleware/authmiddleware.js";

const authRouter = Router();

authRouter.post("/login", login);

authRouter.post("/signup", signup);

authRouter.post("/logout", logout);

authRouter.post("/onboarding",protectRoute, onboard);

authRouter.get("/test-cookie", (req, res) => {
  console.log("Test - All cookies:", req.cookies);
  res.json({ cookies: req.cookies });
});

authRouter.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default authRouter;