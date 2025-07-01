import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body; // token sent from frontend (Google)
    if (!credential) return res.status(400).json({ error: 'Missing token' });

    // 1. Verify token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    // 2. Find or Create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        googleId: sub,
        email,
        fullName: name,
        profilePictureUrl: picture,
        isVerified: true,
      });
    }

    // 3. Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Google login success',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl,
      },
    });
  } catch (err) {
    console.error('Google login failed:', err);
    res.status(500).json({ error: 'Google login failed' });
  }
};
