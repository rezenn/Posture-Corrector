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
import pygame
import csv
from datetime import datetime
from fpdf import FPDF

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

# Nepali TTS using gTTS and pygame


def speak_np(text):
    def play_nepali():
        try:
            tts = gTTS(text=text, lang='ne')
            filename = "nep_speech.mp3"
            tts.save(filename)

            pygame.mixer.init()
            pygame.mixer.music.load(filename)
            pygame.mixer.music.play()
            while pygame.mixer.music.get_busy():
                time.sleep(0.1)
            pygame.mixer.music.unload()
            os.remove(filename)
        except Exception as e:
            print("Nepali TTS error:", e)

    threading.Thread(target=play_nepali, daemon=True).start()

# English TTS using pyttsx3


def speak_en(text):
    threading.Thread(target=lambda: tts_engine.say(
        text) or tts_engine.runAndWait(), daemon=True).start()

# Angle calculator


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
        self.root.title("Upryt")
        self.root.geometry("1200x800")
        self.root.configure(bg="#f0f2f5")

        self.language = tk.StringVar(value="English")
        self.bad_posture_start = None
        self.alert_cooldown = 1
        self.last_alert_time = 0

        self.session_active = False
        self.start_time = None
        self.good_posture_time = 0
        self.bad_posture_time = 0
        self.last_posture = None
        self.posture_change_time = self.start_time
        self.correction_count = 0
        self.posture_change_count = 0
        self.max_good_streak = 0
        self.max_poor_streak = 0
        self.current_streak_start = self.start_time
        self.current_streak_type = None

        TITLE_FONT = ("Segoe UI", 22, "bold")
        LABEL_FONT = ("Segoe UI", 12)
        STATUS_FONT = ("Segoe UI", 16, "bold")
        ANGLE_FONT = ("Consolas", 11)

        main_frame = ttk.Frame(root)
        main_frame.pack(fill="both", expand=True, padx=10, pady=10)

        left_frame = ttk.Frame(main_frame)
        left_frame.pack(side="left", fill="both", expand=True)

        right_frame = ttk.Frame(main_frame, width=350)
        right_frame.pack(side="right", fill="both")
        right_frame.pack_propagate(False)

        tk.Label(left_frame, text="Posture Monitoring System", font=TITLE_FONT,
                 bg="#f0f2f5", fg="#2c3e50").pack(pady=(15, 10))

        lang_frame = ttk.Frame(left_frame, padding=5)
        lang_frame.pack()
        ttk.Label(lang_frame, text="Language:",
                  font=LABEL_FONT).pack(side="left", padx=5)
        ttk.OptionMenu(lang_frame, self.language, "English",
                       "English", "Nepali").pack(side="left")

        status_frame = ttk.Frame(left_frame, padding=10)
        status_frame.pack(pady=(15, 5))

        self.status_var = tk.StringVar(value="Initializing...")
        self.angle_var = tk.StringVar(value="Angle Info")

        ttk.Label(status_frame, text="Posture Status:", font=LABEL_FONT).grid(
            row=0, column=0, sticky="w", padx=(0, 5))
        self.status_label = ttk.Label(status_frame, textvariable=self.status_var,
                                      font=STATUS_FONT, foreground="blue")
        self.status_label.grid(row=0, column=1, sticky="w")

        ttk.Label(status_frame, text="Angles (Shoulder, Neck, Spine, Symmetry) + Distance:",
                  font=LABEL_FONT).grid(row=1, column=0, columnspan=2, sticky="w", pady=(10, 2))
        ttk.Label(status_frame, textvariable=self.angle_var, font=ANGLE_FONT,
                  background="#ffffff", foreground="#333333", relief="groove", padding=4).grid(
            row=2, column=0, columnspan=2, sticky="we", pady=5)

        video_frame = ttk.LabelFrame(
            left_frame, text="Live Camera Feed", padding=10)
        video_frame.pack(fill="both", expand=True, padx=10, pady=10)
        self.video_label = ttk.Label(video_frame)
        self.video_label.pack()

        # Right panel content
        stats_frame = ttk.LabelFrame(
            right_frame, text="Session Statistics", padding=15)
        stats_frame.pack(fill="both", expand=True, padx=10, pady=10)

        # Create all stats labels and variables
        self.stats_vars = {
            "Session Time": tk.StringVar(value="0s"),
            "Good Posture Time": tk.StringVar(value="0s"),
            "Poor Posture Time": tk.StringVar(value="0s"),
            "Corrections": tk.StringVar(value="0"),
            "Posture Changes": tk.StringVar(value="0"),
            "Current Streak": tk.StringVar(value="0s (Good)"),
            "Max Good Streak": tk.StringVar(value="0s"),
            "Max Poor Streak": tk.StringVar(value="0s"),
            "Good Posture %": tk.StringVar(value="0%")
        }

        for i, (text, var) in enumerate(self.stats_vars.items()):
            ttk.Label(stats_frame, text=text, font=LABEL_FONT).grid(
                row=i, column=0, sticky="w", padx=5, pady=3)
            ttk.Label(stats_frame, textvariable=var, font=LABEL_FONT).grid(
                row=i, column=1, sticky="e", padx=5, pady=3)

        # Buttons frame
        buttons_frame = ttk.Frame(right_frame)
        buttons_frame.pack(fill="x", padx=10, pady=(0, 10))

        ttk.Button(buttons_frame, text="Export CSV",
                   command=self.export_stats).pack(side="left", fill="x", expand=True, padx=5)
        ttk.Button(buttons_frame, text="Export PDF",
                   command=self.export_pdf).pack(side="left", fill="x", expand=True, padx=5)

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

        # Start session timer when the first valid frame is received
        if not self.session_active:
            self.session_active = True
            self.start_time = time.time()
            self.posture_change_time = self.start_time
            self.current_streak_start = self.start_time

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

            def get_point(lm): return (
                int(lms[lm].x * frame_w), int(lms[lm].y * frame_h))

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

            is_bad_posture = posture_status == "Poor Posture"

            if is_bad_posture:
                if self.bad_posture_start is None:
                    self.bad_posture_start = time.time()
                elif time.time() - self.bad_posture_start > 2:
                    self.speak_alert("Please fix your posture.",
                                     "कृपया आफ्नो बस्ने तरिका सुधार गर्नुहोस्।")
                    self.correction_count += 1
                    self.stats_vars["Corrections"].set(
                        str(self.correction_count))
            else:
                self.bad_posture_start = None

            mp_drawing.draw_landmarks(
                frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        self.status_var.set(posture_status)
        self.status_label.configure(
            foreground="green" if posture_status == "Good Posture" else "red")
        self.angle_var.set(
            f"{shoulder_angle:.1f}°, {neck_angle:.1f}°, {spine_angle:.1f}°, Δ={symmetry_diff:.1f}° | Distance: {eye_distance:.1f}px ({distance_status})")

        display_frame = cv2.putText(frame.copy(), posture_status, (10, 30),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1,
                                    (0, 255, 0) if posture_status == "Good Posture" else (0, 0, 255), 2)

        img = Image.fromarray(cv2.cvtColor(display_frame, cv2.COLOR_BGR2RGB))
        imgtk = ImageTk.PhotoImage(image=img)
        self.video_label.imgtk = imgtk
        self.video_label.configure(image=imgtk)

        # Update statistics
        now = time.time()
        session_duration = now - self.start_time

        # Update posture times
        if posture_status == "Good Posture":
            self.good_posture_time += 0.1  # Since we update every 100ms (0.1s)
        else:
            self.bad_posture_time += 0.1

        # Handle posture changes and streaks
        if posture_status != self.last_posture:
            self.posture_change_count += 1
            self.stats_vars["Posture Changes"].set(
                str(self.posture_change_count))

            # Update streaks
            if posture_status == "Good Posture":
                # Just switched to good posture
                streak_duration = now - self.current_streak_start
                if self.current_streak_type == "Poor":
                    if streak_duration > self.max_poor_streak:
                        self.max_poor_streak = streak_duration
                        self.stats_vars["Max Poor Streak"].set(
                            f"{int(streak_duration)}s")
            else:
                # Just switched to poor posture
                streak_duration = now - self.current_streak_start
                if self.current_streak_type == "Good":
                    if streak_duration > self.max_good_streak:
                        self.max_good_streak = streak_duration
                        self.stats_vars["Max Good Streak"].set(
                            f"{int(streak_duration)}s")

            # Reset current streak
            self.current_streak_start = now
            self.current_streak_type = "Good" if posture_status == "Good Posture" else "Poor"

        # Update current streak display
        current_streak_duration = now - self.current_streak_start
        self.stats_vars["Current Streak"].set(
            f"{int(current_streak_duration)}s ({self.current_streak_type})" if self.current_streak_type else "0s")

        self.last_posture = posture_status

        # Update all stats
        self.stats_vars["Session Time"].set(f"{int(session_duration)}s")
        self.stats_vars["Good Posture Time"].set(
            f"{int(self.good_posture_time)}s")
        self.stats_vars["Poor Posture Time"].set(
            f"{int(self.bad_posture_time)}s")

        # Calculate and update good posture percentage
        if session_duration > 0:
            good_percentage = int(
                (self.good_posture_time / session_duration) * 100)
            self.stats_vars["Good Posture %"].set(f"{good_percentage}%")

        self.root.after(100, self.update_video)

    def on_close(self):
        self.cap.release()
        self.root.destroy()

    def export_stats(self):
        now = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"posture_stats_{now}.csv"
        with open(filename, mode="w", newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["Metric", "Value"])
            writer.writerow(
                ["Session Time (s)", int(time.time() - self.start_time)])
            writer.writerow(
                ["Good Posture Time (s)", int(self.good_posture_time)])
            writer.writerow(
                ["Poor Posture Time (s)", int(self.bad_posture_time)])
            writer.writerow(["Posture Corrections", self.correction_count])
            writer.writerow(["Posture Changes", self.posture_change_count])
            writer.writerow(["Max Good Streak (s)", int(self.max_good_streak)])
            writer.writerow(["Max Poor Streak (s)", int(self.max_poor_streak)])
        self.speak_alert("Session statistics exported successfully.",
                         "सत्रको तथ्यांक सफलतापूर्वक निर्यात गरियो।")

    def export_pdf(self):
        now_text = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, "Upryt", ln=1, align="C")
        pdf.cell(0, 10, "Posture Session Report", ln=2, align="C")
        pdf.ln(5)
        pdf.set_font("Arial", size=15)

        data = [
            ("Generated:", now_text),
            ("Session Time", f"{int(time.time() - self.start_time)}s"),
            ("Good Posture Time", f"{int(self.good_posture_time)}s"),
            ("Poor Posture Time", f"{int(self.bad_posture_time)}s"),
            ("Corrections", str(self.correction_count)),
            ("Posture Changes", str(self.posture_change_count)),
            ("Max Good Streak", f"{int(self.max_good_streak)}s"),
            ("Max Poor Streak", f"{int(self.max_poor_streak)}s"),
            ("Good Posture %",
             f"{int((self.good_posture_time / (time.time() - self.start_time)) * 100)}%")
        ]

        for name, val in data:
            pdf.cell(60, 8, name, border=1)
            pdf.cell(80, 8, val, border=1, ln=1)

        out = f"posture_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        pdf.output(out)
        self.speak_alert("PDF exported successfully.",
                         "पीडीएफ सफलतापूर्वक निर्यात भयो।")


if __name__ == "__main__":
    root = tk.Tk()
    app = PostureApp(root)
    root.protocol("WM_DELETE_WINDOW", app.on_close)
    root.mainloop()
