import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendVerificationEmail = async (email, html) => {
    

  if (!email || !html) {
    return res.status(400).json({ error: 'Missing email or html content' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"UPRYT" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'UPRYT | Your Verification Code',
      html: html, // ✅ ensure it's a string!
    });

  
  } catch (err) {
    console.error('❌ Email failed:', err);
  }
};