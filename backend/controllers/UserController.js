// backend/controllers/UserController.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import { sendVerificationEmail } from "../helpers/sendVerificationEmail.jsx";

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

    }
    // send verfication email
    const emailResponse = await sendVerificationEmail(fullName, email, otp);

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message
        },
        {
          status: 500
        }
      );
    }

    return res.status(201).json({ sucess: true, message: 'User signed up successfully. Please verify your email' });
  }
  catch (error) {
    console.error("Error signing up the user: ", error);
    res.status(500).json({ success: false, message: 'Error signing up the user' });
  }
};

export const loginUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user;
    if (username) {
      user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }
    }

    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }
    const token = user.generateJWT();
    res.status(200).json({ token, user, message: 'Login successful' });
  }
  catch (error) {
    res.status(500).json({ error: 'Server error' });
  }

};

export const checkUsernameUnique = async (req, res) => {
  const { username } = req.query;

  try {
    const existingUser = await User.findOne({ username, isVerified: true });
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