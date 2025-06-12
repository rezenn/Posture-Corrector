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


# === MediaPipe Pose Setup ===
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(static_image_mode=False,
                    min_detection_confidence=0.5, min_tracking_confidence=0.5)


def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / \
        (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-7)
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    return np.degrees(angle)


class PostureApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Posture Monitor AI")
        self.status_var = tk.StringVar(value="Initializing...")
        self.angle_var = tk.StringVar(value="Angle Info")

        ttk.Label(root, text="Posture Status:", font=("Arial", 14)).pack()
        ttk.Label(root, textvariable=self.status_var,
                  font=("Arial", 18, "bold")).pack()
        ttk.Label(root, text="Angles (Shoulder, Neck, Spine, Symmetry):",
                  font=("Arial", 12)).pack()
        ttk.Label(root, textvariable=self.angle_var,
                  font=("Arial", 12)).pack()

        self.video_label = ttk.Label(root)
        self.video_label.pack()

        self.cap = cv2.VideoCapture(0)
        self.last_alert_time = 0
        self.alert_cooldown = 5
        self.update_video()

    def update_video(self):
        ret, frame = self.cap.read()
        if not ret:
            self.status_var.set("Camera error.")
            return

        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb_frame)

        posture_status = "Unknown"
        shoulder_angle = neck_angle = spine_angle = symmetry_diff = 0

        if results.pose_landmarks:
            lms = results.pose_landmarks.landmark
            frame_h, frame_w = frame.shape[:2]

            def get_point(landmark): return (int(
                lms[landmark].x * frame_w), int(lms[landmark].y * frame_h))

            l_sh = get_point(mp_pose.PoseLandmark.LEFT_SHOULDER)
            r_sh = get_point(mp_pose.PoseLandmark.RIGHT_SHOULDER)
            l_ear = get_point(mp_pose.PoseLandmark.LEFT_EAR)
            r_ear = get_point(mp_pose.PoseLandmark.RIGHT_EAR)
            l_hip = get_point(mp_pose.PoseLandmark.LEFT_HIP)
            r_hip = get_point(mp_pose.PoseLandmark.RIGHT_HIP)

            mid_sh = ((l_sh[0] + r_sh[0]) // 2, (l_sh[1] + r_sh[1]) // 2)
            mid_hip = ((l_hip[0] + r_hip[0]) // 2, (l_hip[1] + r_hip[1]) // 2)
            mid_ear = ((l_ear[0] + r_ear[0]) // 2, (l_ear[1] + r_ear[1]) // 2)

            # === Angle Calculations ===
            shoulder_angle = calculate_angle(l_sh, r_sh, (r_sh[0], 0))
            neck_angle = calculate_angle(l_ear, l_sh, (l_sh[0], 0))
            spine_angle = calculate_angle(mid_ear, mid_sh, mid_hip)

            # === Symmetry (left vs right ear–shoulder–hip) ===
            left_spine = calculate_angle(l_ear, l_sh, l_hip)
            right_spine = calculate_angle(r_ear, r_sh, r_hip)
            symmetry_diff = abs(left_spine - right_spine)

            # === Posture Classification ===
            if model_loaded:
                label = clf.predict(
                    [[shoulder_angle, neck_angle, spine_angle, symmetry_diff]])[0]
                posture_status = "Good Posture" if label == "good" else "Poor Posture"
            else:
                # Rule-based logic
                if (
                    shoulder_angle < 90 or
                    neck_angle < 30 or
                    spine_angle < 140 or
                    symmetry_diff > 15
                ):
                    posture_status = "Poor Posture"
                    if time.time() - self.last_alert_time > self.alert_cooldown:
                        speak("Please fix your posture.")
                        self.last_alert_time = time.time()
                else:
                    posture_status = "Good Posture"

            # Draw pose
            mp_drawing.draw_landmarks(
                frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        # === Display Info ===
        self.status_var.set(posture_status)
        self.angle_var.set(
            f"{shoulder_angle:.1f}, {neck_angle:.1f}, {spine_angle:.1f}, Δ={symmetry_diff:.1f}")

        display_frame = cv2.putText(frame.copy(), posture_status, (10, 30),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1,
                                    (0, 255, 0) if posture_status == "Good Posture" else (0, 0, 255), 2)

        img = Image.fromarray(cv2.cvtColor(display_frame, cv2.COLOR_BGR2RGB))
        imgtk = ImageTk.PhotoImage(image=img)
        self.video_label.imgtk = imgtk
        self.video_label.configure(image=imgtk)

        self.root.after(10, self.update_video)

    def on_close(self):
        self.cap.release()
        self.root.destroy()


# === Start Application ===
if __name__ == "__main__":
    root = tk.Tk()
    app = PostureApp(root)
    root.protocol("WM_DELETE_WINDOW", app.on_close)
    root.mainloop()
