import mongoose from "mongoose";
import { hash, genSaltSync, compare } from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    branch: {
      type: String,
      enum: ["CSE", "ECE", "ME", "CE", "EE", "CS-DS", "VLSI", "EE-CE"],
    },
    sem: { type: String, enum: ["1", "2", "3", "4", "5", "6", "7", "8"] },
    isOnboarded: { type: Boolean, default: false },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    avatar: { type: String, default: "" },
    emailOtp: { type: String },
    emailOtpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hash(this.password, genSaltSync(10));
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await compare(candidatePassword, this.password);
  return isMatch;
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token and save to database
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiration time (1 hour from now)
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  // Return unhashed token to send via email
  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;