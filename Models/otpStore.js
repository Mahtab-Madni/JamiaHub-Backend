import mongoose from "mongoose";

const otpStoreSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    otpExpiry: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs
otpStoreSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 });

const OtpStore = mongoose.model("OtpStore", otpStoreSchema);
export default OtpStore;
