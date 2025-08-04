import express from 'express';
import { receivePostureData, getLatestPostureData,getPostureByUser } from '../controllers/postureController.js';

const router = express.Router();

router.post('/posture', receivePostureData);
router.get('/posture/latest', getLatestPostureData);
router.get('/get-posture-details/:userId', getPostureByUser);


export default router;
