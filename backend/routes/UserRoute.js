import express from "express";
import { authGuard } from "../middlewares/authGuard.js";
import { createUser, loginUser, checkUsernameUnique, handleSendEmailForRegistration, findUserByUsername, verifyOTPForRegistration, forgotPassword, verifyOTPForResetPassword, resetPassword } from "../controllers/UserController.js";
import { googleLogin } from "../controllers/authController.js";
// import { body } from "express-validator";
import upload from './../middlewares/UploadImage';

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

router.put("/profile-picture", upload.single("profilePictureUrl"), uploadImage);
router.put("/update-profile-details/:id", authGuard, updateProfileDetails);
router.delete("/delete-user", authGuard, deleteUser);

router.post("/find-by-username", findUserByUsername);

export default router;  