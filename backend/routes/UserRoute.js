import express from 'express';
import { createUser, loginUser, checkUsernameUnique ,handleSendEmail,findUserByUsername} from '../controllers/UserController.js';
// import { body } from 'express-validator';
import { googleLogin } from '../controllers/authController.js';


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
router.post('/find-by-username', findUserByUsername);


router.post('/send-verification', handleSendEmail);

router.post('/google-login', googleLogin);


export default router;  