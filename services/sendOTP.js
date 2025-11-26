import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config()

// Configure your email service (example with Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
  },
});

export async function sendVerificationEmail(email, otp) {
  const mailOptions = {
    from: `JamiaHub < ${process.env.EMAIL_USER} >`, 
    to: email,
    subject: "Email Verification - Your OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h2 style="color: #333; margin-bottom: 10px;">JamiaHub Email Verification</h2>
        <p style="color: #555; margin: 0 0 15px;">
          Welcome to JamiaHub! To complete your registration, please enter the One-Time Password (OTP) provided below:
        </p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0; border: 1px solid #e0e0e0;">
          <h1 style="color: #4CAF50; margin: 0; letter-spacing: 6px; font-size: 32px;">${otp}</h1>
        </div>
        <p style="color: #666; margin: 0 0 10px;">
          This OTP is valid for <strong>10 minutes</strong>. Please complete your verification promptly.
        </p>
        <p style="color: #666; margin: 0 0 10px;">
          If you did not initiate this request, you can safely disregard this email.
        </p>
        <p style="color: #999; font-size: 12px; margin: 20px 0 0; text-align: center;">
          This is an automatically generated email. Please do not reply.
        </p>
        <hr style="margin: 25px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          © JamiaHub. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
}
