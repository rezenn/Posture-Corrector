import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import axios from 'axios'; // ✅ Add this

export const googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ error: 'Missing access_token' });
    }

    // ✅ Step 1: Get user info from Google API
    const googleUser = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { sub, email, name, picture } = googleUser.data;

    // ✅ Step 2: Find or create user
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

    // ✅ Step 3: Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: '✅ Google login success',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl,
      },
    });

  } catch (err) {
    console.error('Google login failed:', err.message);
    res.status(500).json({ error: 'Google login failed' });
  }
};
