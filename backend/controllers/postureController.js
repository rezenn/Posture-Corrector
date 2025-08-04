import Posture from '../models/posture.js';
import axios from 'axios';
import FormData from 'form-data';

let latestPostureData = null;

export const receivePostureData = async (req, res) => {
  const incoming = req.body;

  const enriched = {
    userId: 'user123',
    timestamp: new Date(),
    ...incoming
  };

  latestPostureData = enriched;

  try {
    const saved = await Posture.create(enriched);
    res.status(200).json({ status: 'received', data: saved });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getLatestPostureData = (req, res) => {
  if (latestPostureData) {
    res.json({ status: 'success', data: latestPostureData });
  } else {
    res.json({ status: 'waiting', data: null });
  }
};


export const processFrame = async (req, res) => {
  const { image } = req.body;

  try {
    // Extract base64 from data URL
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');

    const form = new FormData();
    form.append('image', imgBuffer, {
      filename: 'frame.jpg',
      contentType: 'image/jpeg',
    });

    const response = await axios.post('http://localhost:5001/process', form, {
      headers: form.getHeaders()
    });

    res.json({ status: "success", data: response.data });
  } catch (err) {
    console.error("Error sending image to Python:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};