import express from 'express';
import { receivePostureData, getLatestPostureData } from '../controllers/postureController.js';

const router = express.Router();

router.post('/posture', receivePostureData);
router.get('/posture/latest', getLatestPostureData);

export default router;
