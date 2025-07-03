import nodemailer from "nodemailer";

export const sendResetPasswordVerificationEmail = async (
    email,
    html
) => {
    if (!email || !html) {
        return res
            .status(400)
            .json({ error: "Missing email or html content" });
    }

    try {
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