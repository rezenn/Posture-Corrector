import cv2
import mediapipe as mp
import numpy as np
import time
import threading
import pyttsx3
import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk
import joblib
from collections import deque

# Load AI model
model_loaded = False
try:
    clf = joblib.load("posture_model.pkl")
    model_loaded = True
except:
    clf = None

# Text-to-Speech
tts_engine = pyttsx3.init()


def speak(text):
    threading.Thread(target=lambda: tts_engine.say(
        text) or tts_engine.runAndWait(), daemon=True).start()


# MediaPipe Pose Setup with 3D (model_complexity=1 for better 3D)
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,  # 3D pose estimation enabled
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)


def calculate_angle(a, b, c):
    """Calculate the angle between points a, b, c with 3D support."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba)
                                     * np.linalg.norm(bc) + 1e-7)
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    return np.degrees(angle)


class PostureApp:
    def __init__(self, root):
        self.root = root
        self.root.title("🧍 Posture Monitor AI")
        self.root.configure(bg="#f0f0f0")

        self.status_var = tk.StringVar(value="Initializing...")
        self.distance_var = tk.StringVar(value="Distance Info")
        self.angle_var = tk.StringVar(value="Angles: Loading...")

        # Title
        ttk.Label(root, text="Posture Monitor AI", font=(
            "Arial", 20, "bold")).pack(pady=(10, 5))

        # Posture Status Section
        self.status_label = ttk.Label(
            root, textvariable=self.status_var, font=("Arial", 18), foreground="blue")
        self.status_label.pack(pady=5)

        # Distance Info
        self.distance_label = ttk.Label(
            root, textvariable=self.distance_var, font=("Arial", 14))
        self.distance_label.pack(pady=5)

        # Angle Info
        self.angle_label = ttk.Label(
            root, textvariable=self.angle_var, font=("Arial", 12))
        self.angle_label.pack(pady=5)

        # Video Feed
        self.video_label = ttk.Label(root)
        self.video_label.pack(pady=10)

        self.cap = cv2.VideoCapture(0)
        self.last_alert_time = 0
        self.alert_cooldown = 5

        # History buffers for smoothing angles (5 frames)
        self.angle_history = {
            "shoulder": deque(maxlen=5),
            "neck": deque(maxlen=5),
            "spine": deque(maxlen=5),
            "symmetry": deque(maxlen=5)
        }

        self.update_video()

    def smooth_angle(self, angle_type, new_value):
        """Smooth angle by moving average over last frames."""
        self.angle_history[angle_type].append(new_value)
        return np.mean(self.angle_history[angle_type])

    def update_video(self):
        ret, frame = self.cap.read()
        if not ret:
            self.status_var.set("Camera error.")
            return

        frame = cv2.flip(frame, 1)
        frame_h, frame_w = frame.shape[:2]

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb_frame)

        posture_status = "Unknown"
        shoulder_angle = neck_angle = spine_angle = symmetry_diff = 0
        eye_distance = 0
        distance_status = "Unknown"

        if results.pose_landmarks:
            lms = results.pose_landmarks.landmark

            def get_point_3d(landmark):
                return (
                    lms[landmark].x * frame_w,
                    lms[landmark].y * frame_h,
                    lms[landmark].z * 1000  # scaled for easier use
                )

            # Get 3D points
            l_sh = get_point_3d(mp_pose.PoseLandmark.LEFT_SHOULDER)
            r_sh = get_point_3d(mp_pose.PoseLandmark.RIGHT_SHOULDER)
            l_ear = get_point_3d(mp_pose.PoseLandmark.LEFT_EAR)
            r_ear = get_point_3d(mp_pose.PoseLandmark.RIGHT_EAR)
            l_hip = get_point_3d(mp_pose.PoseLandmark.LEFT_HIP)
            r_hip = get_point_3d(mp_pose.PoseLandmark.RIGHT_HIP)
            l_eye = get_point_3d(mp_pose.PoseLandmark.LEFT_EYE)
            r_eye = get_point_3d(mp_pose.PoseLandmark.RIGHT_EYE)

            mid_sh = tuple(np.mean([l_sh, r_sh], axis=0))
            mid_hip = tuple(np.mean([l_hip, r_hip], axis=0))
            mid_ear = tuple(np.mean([l_ear, r_ear], axis=0))

            # Calculate angles
            shoulder_angle_raw = calculate_angle(
                l_sh, r_sh, (r_sh[0], r_sh[1], r_sh[2]))
            neck_angle_raw = calculate_angle(
                l_ear, l_sh, (l_sh[0], l_sh[1], l_sh[2]))
            spine_angle_raw = calculate_angle(mid_ear, mid_sh, mid_hip)

            left_spine_raw = calculate_angle(l_ear, l_sh, l_hip)
            right_spine_raw = calculate_angle(r_ear, r_sh, r_hip)
            symmetry_diff_raw = abs(left_spine_raw - right_spine_raw)

            # Smooth angles
            shoulder_angle = self.smooth_angle("shoulder", shoulder_angle_raw)
            neck_angle = self.smooth_angle("neck", neck_angle_raw)
            spine_angle = self.smooth_angle("spine", spine_angle_raw)
            symmetry_diff = self.smooth_angle("symmetry", symmetry_diff_raw)

            # Eye Distance (2D pixel distance ignoring z for proximity check)
            eye_distance = np.linalg.norm(
                np.array(l_eye[:2]) - np.array(r_eye[:2]))
            min_eye_dist = 50
            max_eye_dist = 110

            if eye_distance < min_eye_dist:
                distance_status = "📏 Too Far"
                if time.time() - self.last_alert_time > self.alert_cooldown:
                    speak("You are sitting too far. Please move closer.")
                    self.last_alert_time = time.time()
            elif eye_distance > max_eye_dist:
                distance_status = "📏 Too Close"
                if time.time() - self.last_alert_time > self.alert_cooldown:
                    speak("You are too close to the screen. Please move back.")
                    self.last_alert_time = time.time()
            else:
                distance_status = "✅ Good Distance"

            # Posture Prediction (AI model if loaded)
            if model_loaded:
                label = clf.predict(
                    [[shoulder_angle, neck_angle, spine_angle, symmetry_diff]])[0]
                posture_status = "✅ Good Posture" if label == "good" else "⚠️ Poor Posture"
            else:
                # Heuristic fallback
                if (
                    shoulder_angle < 90 or
                    neck_angle < 25 or
                    spine_angle < 140 or
                    symmetry_diff > 15
                ):
                    posture_status = "⚠️ Poor Posture"
                    if time.time() - self.last_alert_time > self.alert_cooldown:
                        speak("Please fix your posture.")
                        self.last_alert_time = time.time()
                else:
                    posture_status = "✅ Good Posture"

            # Draw landmarks on frame
            mp_drawing.draw_landmarks(
                frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        # Update GUI labels
        self.status_var.set(posture_status)
        self.distance_var.set(
            f"Distance: {eye_distance:.1f}px → {distance_status}")
        self.angle_var.set(
            f"Angles → Shoulder: {shoulder_angle:.1f}, Neck: {neck_angle:.1f}, Spine: {spine_angle:.1f}, Δ={symmetry_diff:.1f}"
        )

        # Display posture status on video frame
        color = (0, 255, 0) if "Good" in posture_status else (0, 0, 255)
        display_frame = cv2.putText(frame.copy(), posture_status, (10, 30),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

        # Convert to ImageTk for Tkinter display
        img = Image.fromarray(cv2.cvtColor(display_frame, cv2.COLOR_BGR2RGB))
        imgtk = ImageTk.PhotoImage(image=img)
        self.video_label.imgtk = imgtk
        self.video_label.configure(image=imgtk)

        self.root.after(10, self.update_video)

    def on_close(self):
        self.cap.release()
        self.root.destroy()


# Run Application
if __name__ == "__main__":
    root = tk.Tk()
    app = PostureApp(root)
    root.protocol("WM_DELETE_WINDOW", app.on_close)
    root.mainloop()
