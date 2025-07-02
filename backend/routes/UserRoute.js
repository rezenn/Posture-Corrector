import express from 'express';
import { authGuard } from "../middlewares/authGuard.js";
import { createUser, loginUser, checkUsernameUnique } from '../controllers/UserController.js';
// import { body } from 'express-validator';

const router = express.Router();

router.post('/register-user', createUser);
router.post('/login-user', loginUser);
router.get('/check-username-unique', checkUsernameUnique);

// Validation rules for user registration
// const validationRules = [
//     body('username').notEmpty().withMessage('Username is required'),
//     body('email').isEmail().withMessage('Invalid email format'),
//     body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
// ];


export default router;  