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
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Hello ${fullName},</h2>
        <p>You have requested to reset your password for your UPRYT account.</p>
        <p><strong>Your OTP:</strong> <span style="font-size: 24px; color: #0d47a1;">${otp}</span></p>
        <p>This code is valid for 10 minutes.</p>
        <p>If you didn’t request this, you can ignore this email.</p>
        <p>– The UPRYT Team</p>
      </div>
    `;


    await transporter.sendMail({
      from: `"UPRYT" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'UPRYT | Password Reset Code',
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return { success: false, message: 'Email sending failed' };
  }
};
