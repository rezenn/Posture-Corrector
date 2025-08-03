import nodemailer from "nodemailer";
import VerificationEmail from '../emails/VerificationEmail';

export const sendVerificationEmail = async (fullName, email, otp) => {
  const html = await render(
    <VerificationEmail fullName={fullName} email={email} otp={otp} />
  );

  // if (!email || !html) {
  //   return res
  //     .status(400)
  //     .json({ error: "Missing email or html content" });
  // }
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"UPRYT" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "UPRYT | Your Verification Code",
      html,
    });

    return {
      success: true,
      message: "Verification email sent  successfully.",
    };
  } catch (error) {
    console.log("Error sending verification email: ", error);

    return {
      success: false,
      message: "Failed to send verification email.",
    };
  }
};