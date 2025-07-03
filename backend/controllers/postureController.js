import Posture from '../models/posture.js';

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
