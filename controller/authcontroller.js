import { upsertStreamUser } from '../lib/stream.js';
import  User  from '../Models/user.js';
import jwt from "jsonwebtoken";
import { otpGenerate } from "../utils/otpGenerator.js";
import { sendVerificationEmail } from '../services/sendOTP.js';
import OtpStore from '../Models/otpStore.js';

export async function sendOtp(req, res) {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailRegrex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegrex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate OTP
    const otp = otpGenerate();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP temporarily (you might want to use Redis for this)
    // For now, we'll store it in a temporary collection or in-memory store
    await OtpStore.findOneAndUpdate(
      { email },
      { otp, otpExpiry },
      { upsert: true, new: true }
    );

    // Send OTP via email (this will throw error if email doesn't exist/invalid)
    try {
      await sendVerificationEmail(email, otp);
    } catch (emailError) {
      // Clean up OTP store if email sending fails
      await OtpStore.deleteOne({ email });
      return res.status(400).json({
        message:
          "Failed to send email. Please check if the email address is valid.",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
}

export async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpRecord = await OtpStore.findOne({ email });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "OTP not found. Please request a new one" });
    }

    if (otpRecord.otpExpiry < new Date()) {
      await OtpStore.deleteOne({ email });
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is valid
    await OtpStore.deleteOne({ email });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
}

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
      isVerified: true,
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
