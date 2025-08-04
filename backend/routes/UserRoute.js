import express from "express";
import { authGuard } from "../middlewares/authGuard.js";
import { createUser, loginUser, checkUsernameUnique, handleSendEmailForRegistration, findUserByUsername, verifyOTPForRegistration, forgotPassword, verifyOTPForResetPassword, resetPassword } from "../controllers/UserController.js";
import { googleLogin } from "../controllers/authController.js";
// import { body } from "express-validator";


const router = express.Router();

router.post("/register-user", createUser);
router.post("/login-user", loginUser);
router.get("/check-username-unique", checkUsernameUnique);
router.put("/send-verification-email-registration", handleSendEmailForRegistration);
router.post("/google-login", googleLogin);
router.put("/verify-account-registration", verifyOTPForRegistration);
router.put("/forgot-password", forgotPassword);
router.put("/verify-account-reset-password", verifyOTPForResetPassword);
router.put("/reset-password", resetPassword);

router.post("/find-by-username", findUserByUsername);
// Validation rules for user registration
// const validationRules = [
//     body("username").notEmpty().withMessage("Username is required"),
//     body("email").isEmail().withMessage("Invalid email format"),
//     body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
// ];





export default router;  