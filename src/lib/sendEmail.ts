import nodemailer from "nodemailer";

export async function sendSecurityEmail(subject: string, text: string) {
  console.log("Inside sendSecurityEmail:", subject, text);
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER || "smtp.mailgun.org",
      port: 587,
      secure: false, // Mailgun uses TLS on port 587
      auth: {
        user: process.env.SMTP_USER || "postmaster@your-domain.mailgun.org",
        pass: process.env.SMTP_PASS || "your-mailgun-smtp-password",
      },
    });
    await transporter.sendMail({
      from: '"Security Alerts" <alerts@example.com>',
      to: process.env.ADMIN_ALERT_EMAIL || "security@example.com",
      subject,
      text,
    });
    console.log("Security email sent successfully.");
  } catch (error) {
    console.log("Error occurred in sendSecurityEmail");
    console.error("Security email sending failed:", error);
  }
} 