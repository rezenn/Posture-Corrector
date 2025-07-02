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
    required: true,
    unique: true,
    trim: true,
    minLength: [10, 'Contact must be at least 10 characters long'],
    maxLength: [10, 'Contact must not be longer than 10 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    RegExp: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minLength: [6, 'Email must be at least 6 characters long'],
    maxLength: [50, 'Email must not be longer than 50 characters'],
    RegExp: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [8, 'Password must be at least 8 characters long'],
  },
  profilePictureUrl: {
    type: String,
    required: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifyCode: {
    type: String,
    required: false
  },
  verifyCodeExpiryDate: {
    type: Date,
    required: false
  },
  verifyEmailResetPassword: {
    type: String,
    required: false
  },
  verifyEmailResetPasswordExpiryDate: {
    type: Date,
    required: false
  }
},
  {
    timestamps: true
  });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

const User = mongoose.model('users', userSchema);
export default User;