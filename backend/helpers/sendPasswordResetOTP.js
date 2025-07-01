// backend/helpers/sendPasswordResetOTP.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendPasswordResetOTP = async (fullName, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const html = `
      <h3>Hello ${fullName},</h3>
      <p>Your password reset OTP is:</p>
      <h2>${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
    `;

    await transporter.sendMail({
      from: `"UPRYT" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'UPRYT | Password Reset Code',
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Password reset email failed:', error);
    return { success: false, message: 'Email sending failed' };
  }
};
