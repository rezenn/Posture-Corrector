import express from 'express';
import { receivePostureData, getLatestPostureData,processFrame } from '../controllers/postureController.js';

const router = express.Router();

router.post('/posture', receivePostureData);
router.get('/posture/latest', getLatestPostureData);

router.post('/posture/process-frame', processFrame);

export default router;
