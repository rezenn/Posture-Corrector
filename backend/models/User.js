import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    unique: true,
    sparse: true, // allows null for some users
    trim: true,
    minLength: 10,
    maxLength: 10,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format'],
  },
  password: {
    type: String,
    minLength: 8,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  profilePictureUrl: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifyCode: String,
  verifyCodeExpiryDate: Date,
  verifyEmailResetPassword: String,
  verifyEmailResetPasswordExpiryDate: Date,
}, {
  timestamps: true,
});

// Hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JWT generator
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const User = mongoose.model('User', userSchema);
export default User;
