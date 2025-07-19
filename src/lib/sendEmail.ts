import nodemailer from "nodemailer";

export async function sendSecurityEmail(subject: string, text: string) {
  console.log("Inside sendSecurityEmail:", subject, text);
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: 587,
      secure: false, // Mailgun uses TLS on port 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: 'sukhwadali3@gmail.com',
      to: process.env.ADMIN_ALERT_EMAIL,
      subject,
      text,
    });
    console.log("Security email sent successfully.");
  } catch (error) {
    console.error("Security email sending failed:", error);
  }
} 