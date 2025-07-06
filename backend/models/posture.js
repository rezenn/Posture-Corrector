import mongoose from 'mongoose';

const postureSchema = new mongoose.Schema({
  userId: String,
  timestamp: { type: Date, default: Date.now },
  posture: String,
  shoulder_angle: Number,
  neck_angle: Number,
  spine_angle: Number,
  symmetry_score: Number,
  eye_distance: Number,
  posture_score: Number,
  session: {
    session_time: Number,
    good_posture_time: Number,
    poor_posture_time: Number,
    corrections: Number,
    posture_changes: Number,
    current_streak: Number,
    max_good_streak: Number,
    max_poor_streak: Number,
    good_posture_percent: Number
  }
});

export default mongoose.model('Posture', postureSchema);
