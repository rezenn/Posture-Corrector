import express from 'express';
import { receivePostureData, getLatestPostureData,getPostureByUser } from '../controllers/postureController.js';

const router = express.Router();

router.post('/posture', receivePostureData);
router.get('/posture/latest', getLatestPostureData);
router.get('/get-posture-details/:userId', getPostureByUser);


router.get("/summary", async (req, res) => {
  try {
    const flaskRes = await fetch("http://localhost:5001/generate_summary");
    const data = await flaskRes.json();
    res.json(data);
  } catch (err) {
    console.error("Error calling Python:", err);
    res.status(500).json({ text: "Failed to get summary from Python backend." });
  }
});


export default router;
