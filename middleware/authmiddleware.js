import jwt from "jsonwebtoken";
import User  from "../Models/user.js";
export async function protectRoute (req, res, next) {
  try {
    console.log("All cookies:", req.cookies); // Add this
    console.log("JWT cookie:", req.cookies.jwt); // Add this
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(!decoded){
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Error in protectRoute middleware:", err);
    res.status(500).json({ message: "Server error" });
  }
};