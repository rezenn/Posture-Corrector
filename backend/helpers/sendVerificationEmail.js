import React from "react";
import VerificationEmail from "../emails/VerificationEmail.jsx";
import nodemailer from "nodemailer";
import { render } from '@react-email/components';

export const sendVerificationEmail = async (
    fullName,
    email,
    otp,
) => {
    try {
        const html = await render(
            <VerificationEmail fullName={fullName} email={email} otp={otp} />
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
            subject: "UPRYT | Your Verification Code",
            html
        });

        return {
            success: true,
            message: "Verification email sent  successfully."
        };
    }
    catch (error) {
        console.log("Error sending verification email: ", error);

        return {
            success: false,
            message: "Failed to send verification email."
        };
    }
};