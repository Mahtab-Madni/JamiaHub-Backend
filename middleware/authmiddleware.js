import jwt from "jsonwebtoken";
import User from "../Models/user.js";

export async function protectRoute(req, res, next) {
  try {
    // Check Authorization header first (Bearer token)
    const authHeader = req.headers.authorization;
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
      console.log("Token from Authorization header");
    } else {
      // Fallback to cookie (for backward compatibility)
      token = req.cookies.jwt;
      console.log("Token from cookie");
    }

    console.log("Token present:", !!token);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Error in protectRoute middleware:", err.message);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }
    
    res.status(500).json({ message: "Server error" });
  }
}