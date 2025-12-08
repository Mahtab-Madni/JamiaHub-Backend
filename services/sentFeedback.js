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

export async function sendFeedbackEmail(name, email, message) {
  const mailOptions = {
    from: `JamiaHub <${process.env.EMAIL_USER}>`,
    to: process.env.MY_EMAIL,
    subject: "JamiaHub - User Feedback",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h2 style="color: #333; margin-bottom: 10px;">New Feedback Received</h2>
        <p style="color: #555; margin: 0 0 15px;">
          You have received new feedback from a JamiaHub user .
        </p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #333;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 0; color: #333;"><strong>Email:</strong> ${email}</p>
          <p style="margin-top: 10px; color: #333;"><strong>Feedback:</strong></p>
          <p style="margin: 0; color: #555;">${message}</p>
        </div>
        <p style="color: #999; font-size: 12px; margin: 20px 0 0; text-align: center;">
          This is an automatically generated email from JamiaHub.
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
    console.log("Feedback email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send Feedback email");
  }
}
