import { upsertStreamUser } from '../lib/stream.js';
import  User  from '../Models/user.js';
import jwt from "jsonwebtoken";
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("Token generated successfully");

    // Return token in response body for localStorage
    res.status(200).json({ 
      success: true, 
      user,
      token // Send token to frontend
    });
  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function signup(req, res) {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegrex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegrex.test(email)) {
      return res
        .status(400)
        .json({ message: "Invalid email format"});
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    const idx = Math.floor(Math.random()*100)+1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
    
    const newUser = await User.create({
      email,
      name,
      password,
      avatar: randomAvatar,
    });
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.name,
        image: newUser.avatar || "",
      });
    } catch (error) {
      // If Stream user creation fails, we should still allow the user to sign up
      console.error('Failed to create Stream user:', error);
    }
    res.status(201).json({
      success: true, User: newUser, message:"Account Created Succesfully"
    });

  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function logout(req, res) {
  res.status(200).json({ success: true, message: "Logged out successfully" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    const { bio, branch, sem,} = req.body;
    if (!branch || !sem) {
      return res.status(400).json({ message: "Role, branch, and sem are required" });
    }
    const updatedUser = await User.findByIdAndUpdate(userId,{
      ...req.body,
      isOnboarded: true,
    },
      { new: true }
    )

    await upsertStreamUser({
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      image: updatedUser.avatar || "",
    });
    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Error during onboarding:", err);
    res.status(500).json({ message: "Server error" });
  }
}
