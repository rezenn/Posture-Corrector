// backend/controllers/UserController.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
// import { sendVerificationEmail } from "../helpers/sendVerificationEmail.jsx";

// Create a new user
export const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { fullName, contact, username, email, password } = req.body;

    const existingUserVerifiedByUsername = await User.findOne({ username });
    if (existingUserVerifiedByUsername && existingUserVerifiedByUsername.isVerified === false) {
      return res.status(400).json({ sucess: true, message: 'Username already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const existingUserVerifiedByEmail = await User.findOne({ email });
    if (existingUserVerifiedByEmail) {
      if (existingUserVerifiedByEmail.isVerified) {
        return res.status(400).json(
          {
            success: false,
            message: "Email already exists"
          }
        );
      }
      else {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 10);    // Add 10 mins from 'now'

        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = otp;
        existingUserByEmail.verifyCodeExpiryDate = expiryDate;

        await existingUserByEmail.save();
      }
      return res.statusjson(
        {
          success: false,
          message: "Email is already taken"
        },
        {
          status: 400
        }
      );
    }
    else {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const expiryDate = new Date()
      expiryDate.setMinutes(expiryDate.getMinutes() + 10);

      const newUser = await User({
        fullName,
        username,
        email,
        password: hashedPassword,
        contact,
        profilePictureUrl: "",
        verifyCode: otp,
        verifyCodeExpiryDate: expiryDate,
        isVerified: false,
      });
      await newUser.save();

      // Generate Token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: `${process.env.JWT_SIGNUP_EXPIRES_IN}` }
      );
    }

    // send verfication email
    // const emailResponse = await sendVerificationEmail(fullName, email, otp);

    // if (!emailResponse.success) {
    //   return Response.json(
    //     {
    //       success: false,
    //       message: emailResponse.message
    //     },
    //     {
    //       status: 500
    //     }
    //   );
    // }

    return res.status(201).json({ sucess: true, message: 'User signed up successfully. Please verify your email', token: token, user: newUser });
  }
  catch (error) {
    console.error("Error signing up the user: ", error);
    res.status(500).json({ success: false, message: 'Error signing up the user' });
  }
};

export const verifyOTPForRegistration = async (req, res) => {
  const { email, otp } = req.body;

  // validate email and otp
  if (!email || !otp) {
    return res.status(400).json({ error: "Please, enter email and otp" });
  }

  try {
    // Check existing user
    const checkExistingUser = await User.findOne({ email });
    if (!checkExistingUser) {
      return res.status(400).json({ success: false, message: "Invalid email address. User not available!" });
    }

    const isCodeValid = checkExistingUser.verifyCode === otp;
    const expiryDate = checkExistingUser.verifyCodeExpiryDate ? new Date(checkExistingUser.verifyCodeExpiryDate) : null;
    const isCodeNotExpired = expiryDate ? expiryDate > new Date() : false;

    if (isCodeValid && isCodeNotExpired) {
      await User.findByIdAndUpdate(checkExistingUser._id, {
        isVerified: true,
        verifyCode: null,
        verifyCodeExpiryDate: null,
      });

      return res.status(200).json(
        {
          success: true,
          message: "Account verified successfully"
        }
      );
    }
    else if (!isCodeNotExpired) {
      return res.status(400).json(
        {
          success: false,
          message: "Verification code has expired!"
        }
      );
    }
    else {
      return res.status(400).json(
        {
          success: false,
          message: "Incorrect Verification Code!"
        }
      );
    }
    // return res.status(200).json({ success: true, message: "OTP verified successfully" });
  }
  catch (error) {
    console.log("Error while verifying OTP", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};


// Login user with username or email
export const loginUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let checkExistingUser;
    if (username) {
      checkExistingUser = await User.findOne({ username });
      if (!checkExistingUser) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }
    }

    if (email) {
      checkExistingUser = await User.findOne({ email });
      if (!checkExistingUser) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
    }

    const isMatch = await bcrypt.compare(password, checkExistingUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Generate Token
    const token = jwt.sign(
      { _id: checkExistingUser._id, email: checkExistingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: `${process.env.JWT_LOGIN_EXPIRES_IN}` }
    );

    // const token = user.generateJWT();

    res.status(200).json({ token, user: checkExistingUser, message: 'Login successful' });
  }
  catch (error) {
    res.status(500).json({ error: 'Server error' });
  }

};

export const checkUsernameUnique = async (req, res) => {
  const { username } = req.query;
  console.log("Checking username uniqueness for: ", username);

  if (!username || typeof username !== "string") {
    return res.status(400).json({
      success: false,
      message: "Username is required and must be a string.",
    });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({
      success: false,
      message: "Username must be between 3 and 20 characters.",
    });
  }

  const validUsernamePattern = /^[a-zA-Z0-9_]+$/;
  if (!validUsernamePattern.test(username)) {
    return res.status(400).json({
      success: false,
      message: "Username can only contain letters, numbers, and underscores.",
    });
  }

  try {
    const existingUser = await User.findOne({ username, isVerified: true });
    console.log("Existing user found: ", existingUser);
    if (existingUser) {
      return res.status(200).json({ success: false, message: 'Username already taken' });
    }
    return res.status(200).json({ success: true, message: 'Username is available' });

  }
  catch (error) {
    console.error("Error checking username uniqueness: ", error);
    res.status(500).json({ success: false, message: 'Internal server error while checking username uniqueness' });
  }
};


// // Forgot password functionality
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // validate email
  if (!email) {
    return res.status(400).json({ error: "Please, enter email" });
  }

  try {
    // Check existing user
    const checkExistingUser = await User.findOne({ where: { email } });
    if (!checkExistingUser) {
      return res.status(400).json({ success: false, message: "Invalid email address. User not available!" });
    }

    // send verfication email for reseting password
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10);    // Add 10 mins from 'now'

    await User.findByIdAndUpdate(checkExistingUser._id, {
      verifyEmailResetPassword: otp,
      verifyEmailResetPasswordExpiryDate: expiryDate
    });

    // const emailResponse = await sendResetPasswordVerificationEmail(user?.fullName, email, otp);

    // if (!emailResponse.success) {
    //   return res.status(200).json(
    //     {
    //       success: false,
    //       message: emailResponse.message
    //     }
    //   );
    // }

    return res.status(200).json({ message: "Password reset instructions have been sent to your email", user: checkExistingUser });
  }
  catch (error) {
    console.log("Error while reseting password", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

export const verifyOTPForResetPassword = async (req, res) => {
  const { email, otp } = req.body;
  // validate email and otp
  if (!email || !otp) {
    return res.status(400).json({ error: "Please, enter email and otp" });
  }
  try {
    // Check existing user
    const checkExistingUser = await User.findOne({ email });
    if (!checkExistingUser) {
      return res.status(400).json({ success: false, message: "Invalid email address. User not available!" });
    }

    const isCodeValid = checkExistingUser.verifyEmailResetPassword === otp;
    const expiryDate = checkExistingUser.verifyEmailResetPasswordExpiryDate ? new Date(checkExistingUser.verifyEmailResetPasswordExpiryDate) : null;
    const isCodeNotExpired = expiryDate ? expiryDate > new Date() : false;

    if (isCodeValid && isCodeNotExpired) {
      return res.status(200).json(
        {
          success: true,
          message: "Account verified successfully"
        }
      );
    }
    else if (!isCodeNotExpired) {
      return res.status(400).json(
        {
          success: false,
          message: "Verification code has expired!"
        }
      );
    }
    else {
      return res.status(400).json(
        {
          success: false,
          message: "Incorrect Verification Code!"
        }
      );
    }
  }
  catch (error) {
    console.error("Error verifying OTP for password reset: ", error);
    return res.status(500).json({ success: false, message: "Internal server error while verifying OTP" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  // validate email
  if (!email || !newPassword) {
    return res.status(400).json({ error: "Please, enter email and new password" });
  }

  try {
    // Check existing user
    const checkExistingUser = await User.findOne({ email });
    if (!checkExistingUser) {
      return res.status(400).json({ success: false, message: "Invalid email address. User not available!" });
    }

    // Update password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(checkExistingUser._id, {
      password: hashedPassword,
      verifyEmailResetPassword: "",
      verifyEmailResetPasswordExpiryDate: null
    });

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  }
  catch (error) {
    console.log("Error while resetting password", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};