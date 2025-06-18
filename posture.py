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
from gtts import gTTS
import os
from playsound import playsound

# Load AI model
model_loaded = False
try:
    clf = joblib.load("posture_model.pkl")
    model_loaded = True
except:
    clf = None

# English TTS
tts_engine = pyttsx3.init()

# Pose detection setup
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(static_image_mode=False,
                    min_detection_confidence=0.5, min_tracking_confidence=0.5)


def speak_en(text):
    threading.Thread(target=lambda: tts_engine.say(
        text) or tts_engine.runAndWait(), daemon=True).start()


def speak_np(text):
    def play_nepali():
        tts = gTTS(text=text, lang='ne')
        filename = "nep_speech.mp3"
        tts.save(filename)
        playsound(filename)
        os.remove(filename)
    threading.Thread(target=play_nepali, daemon=True).start()


def calculate_angle(a, b, c):
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
        self.root.title("Posture Monitor AI")
        self.root.geometry("900x720")
        self.root.configure(bg="#f0f2f5")

        # Language toggle
        self.language = tk.StringVar(value="English")

        # Time tracking for posture
        self.bad_posture_start = None
        self.alert_cooldown = 5
        self.last_alert_time = 0

        # Fonts
        TITLE_FONT = ("Segoe UI", 22, "bold")
        LABEL_FONT = ("Segoe UI", 12)
        STATUS_FONT = ("Segoe UI", 16, "bold")
        ANGLE_FONT = ("Consolas", 11)

        # UI elements
        tk.Label(root, text="Posture Monitoring System", font=TITLE_FONT,
                 bg="#f0f2f5", fg="#2c3e50").pack(pady=(15, 10))

        lang_frame = ttk.Frame(root, padding=5)
        lang_frame.pack()
        ttk.Label(lang_frame, text="Language:",
                  font=LABEL_FONT).pack(side="left", padx=5)
        ttk.OptionMenu(lang_frame, self.language, "English",
                       "English", "Nepali").pack(side="left")

        status_frame = ttk.Frame(root, padding=10)
        status_frame.pack(pady=(15, 5))

        self.status_var = tk.StringVar(value="Initializing...")
        self.angle_var = tk.StringVar(value="Angle Info")

        ttk.Label(status_frame, text="Posture Status:", font=LABEL_FONT).grid(
            row=0, column=0, sticky="w", padx=(0, 5))
        self.status_label = ttk.Label(
            status_frame, textvariable=self.status_var, font=STATUS_FONT, foreground="blue")
        self.status_label.grid(row=0, column=1, sticky="w")

        ttk.Label(status_frame, text="Angles (Shoulder, Neck, Spine, Symmetry) + Distance:",
                  font=LABEL_FONT).grid(row=1, column=0, columnspan=2, sticky="w", pady=(10, 2))
        ttk.Label(status_frame, textvariable=self.angle_var,
                  font=ANGLE_FONT, background="#ffffff", foreground="#333333", relief="groove", padding=4
                  ).grid(row=2, column=0, columnspan=2, sticky="we", pady=5)

        video_frame = ttk.LabelFrame(root, text="Live Camera Feed", padding=10)
        video_frame.pack(padx=10, pady=20)
        self.video_label = ttk.Label(video_frame)
        self.video_label.pack()

        self.cap = cv2.VideoCapture(0)
        self.update_video()

    def speak_alert(self, text_en, text_np):
        now = time.time()
        if now - self.last_alert_time > self.alert_cooldown:
            if self.language.get() == "Nepali":
                speak_np(text_np)
            else:
                speak_en(text_en)
            self.last_alert_time = now

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
        eye_distance = 0
        distance_status = "Unknown"
        is_bad_posture = False

        if results.pose_landmarks:
            lms = results.pose_landmarks.landmark
            frame_h, frame_w = frame.shape[:2]

            def get_point(landmark):
                return (int(lms[landmark].x * frame_w), int(lms[landmark].y * frame_h))

            l_sh = get_point(mp_pose.PoseLandmark.LEFT_SHOULDER)
            r_sh = get_point(mp_pose.PoseLandmark.RIGHT_SHOULDER)
            l_ear = get_point(mp_pose.PoseLandmark.LEFT_EAR)
            r_ear = get_point(mp_pose.PoseLandmark.RIGHT_EAR)
            l_hip = get_point(mp_pose.PoseLandmark.LEFT_HIP)
            r_hip = get_point(mp_pose.PoseLandmark.RIGHT_HIP)
            l_eye = get_point(mp_pose.PoseLandmark.LEFT_EYE)
            r_eye = get_point(mp_pose.PoseLandmark.RIGHT_EYE)

            mid_sh = ((l_sh[0] + r_sh[0]) // 2, (l_sh[1] + r_sh[1]) // 2)
            mid_hip = ((l_hip[0] + r_hip[0]) // 2, (l_hip[1] + r_hip[1]) // 2)
            mid_ear = ((l_ear[0] + r_ear[0]) // 2, (l_ear[1] + r_ear[1]) // 2)

            # Angles
            shoulder_angle = calculate_angle(l_sh, r_sh, (r_sh[0], 0))
            neck_angle = calculate_angle(l_ear, l_sh, (l_sh[0], 0))
            spine_angle = calculate_angle(mid_ear, mid_sh, mid_hip)

            left_spine = calculate_angle(l_ear, l_sh, l_hip)
            right_spine = calculate_angle(r_ear, r_sh, r_hip)
            symmetry_diff = abs(left_spine - right_spine)

            eye_distance = np.linalg.norm(np.array(l_eye) - np.array(r_eye))
            min_eye_dist = 40
            max_eye_dist = 110

            if eye_distance < min_eye_dist:
                distance_status = "Too Far"
                self.speak_alert("You are sitting too far. Please move closer.",
                                 "तपाईं धेरै टाढा बस्नु भएको छ। नजिक आउनुहोस्।")
            elif eye_distance > max_eye_dist:
                distance_status = "Too Close"
                self.speak_alert("You are too close to the screen. Please move back.",
                                 "तपाईं धेरै नजिक हुनुहुन्छ। पछि सर्नुहोस्।")
            else:
                distance_status = "Good Distance"

            if model_loaded:
                label = clf.predict(
                    [[shoulder_angle, neck_angle, spine_angle, symmetry_diff]])[0]
                posture_status = "Good Posture" if label == "good" else "Poor Posture"
            else:
                if shoulder_angle < 85 or neck_angle < 25 or spine_angle < 140 or symmetry_diff > 15:
                    posture_status = "Poor Posture"
                else:
                    posture_status = "Good Posture"

            is_bad_posture = (posture_status == "Poor Posture")

            # Time tracking for posture
            if is_bad_posture:
                if self.bad_posture_start is None:
                    self.bad_posture_start = time.time()
                elif time.time() - self.bad_posture_start > 2:
                    self.speak_alert("Please fix your posture.",
                                     "कृपया आफ्नो बस्ने तरिका सुधार गर्नुहोस्।")
            else:
                self.bad_posture_start = None

            mp_drawing.draw_landmarks(
                frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        # GUI updates
        self.status_var.set(posture_status)
        self.status_label.configure(
            foreground="green" if posture_status == "Good Posture" else "red")
        self.angle_var.set(
            f"{shoulder_angle:.1f}, {neck_angle:.1f}, {spine_angle:.1f}, Δ={symmetry_diff:.1f} | Distance: {eye_distance:.1f}px ({distance_status})")

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


if __name__ == "__main__":
    root = tk.Tk()
    app = PostureApp(root)
    root.protocol("WM_DELETE_WINDOW", app.on_close)
    root.mainloop()
