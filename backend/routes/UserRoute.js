import UserController from '../controllers/UserController.js';
import { body } from 'express-validator';
import User from '../models/User.js';
import express from 'express';

const router = express.Router();

router.post('/register', UserController.register);


// Validation rules for user registration
const validationRules = [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

router.post('/register', validationRules, UserController.register);

export default router;  