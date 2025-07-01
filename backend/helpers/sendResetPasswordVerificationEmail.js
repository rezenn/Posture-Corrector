import ResetPasswordEmail from "../../emails/ResetPasswordEmail";
import nodemailer from "nodemailer";
import { render } from '@react-email/components';

export const sendResetPasswordVerificationEmail = async (
    fullName,
    email,
    otp
) => {
    try {
        const html = await render(
            <ResetPasswordEmail fullName={fullName} email={email} otp={otp} />
        );

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        // 3) Send the email
        await transporter.sendMail({
            from: `"UPRYT" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "UPRYT | Verification Code for reseting password",
            html
        });


        return {
            success: true,
            message: "Verification email for reseting password sent  successfully"
        };
    }
    catch (error) {
        console.log("Error sending verification for reseting password email: ", error);

        return {
            success: false,
            message: "Failed to send verification for reseting password email"
        };
    }
};