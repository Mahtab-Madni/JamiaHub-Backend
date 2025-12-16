import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config()

// Create transporter with your email service
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
  },
});

// Send password reset email
export async function sendPasswordResetEmail(email, resetUrl, userName) {
  const mailOptions = {
    from: `JamiaHub <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "JamiaHub Password Reset",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - JamiaHub</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #0066cc 0%, #0099ff 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            color: #333;
            margin-top: 0;
          }
          .content p {
            margin-bottom: 20px;
            color: #555;
          }
          .button {
            display: inline-block;
            padding: 14px 30px;
            background: linear-gradient(135deg, #0066cc 0%, #0099ff 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .button:hover {
            background: linear-gradient(135deg, #0099ff 0%, #0066cc 100%);
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .link {
            word-break: break-all;
            color: #0066cc;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 JamiaHub Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName || "JamiaHub Member"}!</h2>
            <p>We received a request to reset your JamiaHub account password. To continue, please click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>This reset link will expire in <strong>1 hour</strong>.</li>
                <li>If you didn't request this, you can safely ignore this email.</li>
                <li>Your password will remain unchanged until you set a new one.</li>
              </ul>
            </div>
            
            <p>Thank you for being part of JamiaHub — a platform built to empower students and foster collaboration.</p>
            
            <p>Best regards,<br>The JamiaHub Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} JamiaHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("JamiaHub password reset email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send JamiaHub reset email");
  }
}

