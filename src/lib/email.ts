import nodemailer from 'nodemailer';

export const sendPasswordResetEmail = async (email: string, token: string) => {
  console.log('Inside sendPasswordResetEmail');
  try {
    console.log('Preparing to send password reset email...');
    console.log('SMTP_SERVER:', process.env.SMTP_SERVER);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    // Do not log SMTP_PASS for security
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: 587,
      secure: false, // Mailgun uses TLS on port 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetUrl = `https://fullstack-developers-site.vercel.app/reset/${token}`;
    const mailOptions = {
      from: 'sukhwadali3@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      `,
    };
    console.log('Mail options:', mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.log('Error occurred in sendPasswordResetEmail');
    console.error('Email sending failed:', error);
    if (error && typeof error === 'object') {
      for (const [key, value] of Object.entries(error)) {
        console.error(`Error detail: ${key}:`, value);
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}; 