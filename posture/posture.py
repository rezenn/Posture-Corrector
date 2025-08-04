import cv2
import mediapipe as mp
import numpy as np
import time
import threading
import pyttsx3
import ttkbootstrap as ttk
from ttkbootstrap.constants import *
from PIL import Image, ImageTk
import joblib
from gtts import gTTS
import os
import pygame
import csv
from datetime import datetime
from fpdf import FPDF
import requests
import threading

from flask import Flask, Response, jsonify
from flask import Flask, Response
from flask_cors import CORS


import matplotlib.pyplot as plt
from adaptive_feedback import AdaptivePostureFeedback
from nlp_features.feedback import NLPFeedbackGenerator
from nlp_features.sentiment import PostureSentimentAnalyzer
from nlp_features.summary import DailySummaryGenerator

import warnings
from threading import Lock

warnings.filterwarnings("ignore", category=UserWarning)

flask_app = Flask(__name__)
CORS(flask_app)


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
latest_posture_data = {}

latest_gui_frame = None


@flask_app.route("/video_feed")
def video_feed():
    def generate():
        global latest_gui_frame
        while True:
            if latest_gui_frame is not None:
                _, jpeg = cv2.imencode('.jpg', latest_gui_frame)
                frame_bytes = jpeg.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.1)  # Send every 200ms (5 fps) or adjust to 2s if needed
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@flask_app.route("/api/posture/export/pdf", methods=["GET"])
def export_pdf():
    now_text = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data = latest_result.get("session", {})

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "Upryt", ln=1, align="C")
    pdf.cell(0, 10, "Posture Session Report", ln=2, align="C")
    pdf.ln(5)
    pdf.set_font("Arial", size=12)

    items = [
        ("Generated", now_text),
        ("Session Time", f"{data.get('session_time', 0)}s"),
        ("Good Posture Time", f"{data.get('good_posture_time', 0)}s"),
        ("Poor Posture Time", f"{data.get('poor_posture_time', 0)}s"),
        ("Corrections", str(data.get('corrections', 0))),
        ("Posture Changes", str(data.get('posture_changes', 0))),
        ("Max Good Streak", f"{data.get('max_good_streak', 0)}s"),
        ("Max Poor Streak", f"{data.get('max_poor_streak', 0)}s"),
        ("Good Posture %", f"{data.get('good_posture_percent', 0)}%")
    ]

    for name, val in items:
        pdf.cell(60, 10, name, border=1)
        pdf.cell(80, 10, val, border=1, ln=1)

    pdf_output = io.BytesIO()
    pdf.output(pdf_output)
    pdf_output.seek(0)

    return send_file(pdf_output, mimetype='application/pdf', as_attachment=True,
                    download_name=f'posture_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf')

@flask_app.route("/generate_summary", methods=["GET"])
def generate_summary():
    try:
        summary_data = posture_monitor._get_summary_data()
        summary = posture_monitor.summary_generator.generate_summary(summary_data)
        return jsonify({"text": summary["text"]})
    except Exception as e:
        print("Flask summary error:", e)
        return jsonify({"error": str(e)}), 500




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
    def send_data_to_backend(self, payload):
        try:
            print("Sending payload to backend...")
            response = requests.post("http://localhost:5000/api/posture", json=payload, timeout=1)
            print("Backend response:", response.status_code, response.text)
        except Exception as e:
            print("Failed to send to backend:", e)

    

    def __init__(self, root):
        self.root = root
        self.root.title("Upryt")
        self.root.geometry("1280x800")
        self.running = True
        self.nlp_lock = Lock()
        self.nlp_initialized = False

        # Initialize camera
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            raise RuntimeError("Cannot open camera")

        self.adaptive_feedback = AdaptivePostureFeedback()

        # Translation dictionary
        self.issue_translations = {
            "shoulders are not level": "काँधहरू स्तर छैनन्",
            "neck is leaning forward": "घाँटी अगाडि झुकिएको छ",
            "spine is bent": "मेरुदण्ड बाङ्गिएको छ",
            "body is not symmetrical": "शरीर सममित छैन",
            "Your shoulders are leaning left more than usual": "तपाईंको काँधहरू सामान्य भन्दा बायाँतिर धेरै झुकेको छ",
            "Your shoulders are leaning right more than usual": "तपाईंको काँधहरू सामान्य भन्दा दायाँतिर धेरै झुकेको छ",
            "Your neck is leaning forward more than usual": "तपाईंको घाँटी सामान्य भन्दा धेरै अगाडि झुकेको छ",
            "Your spine is more bent than usual": "तपाईंको मेरुदण्ड सामान्य भन्दा धेरै बाङ्गिएको छ",
            "Your posture is less symmetrical than usual": "तपाईंको बसाइ सामान्य भन्दा कम सममित छ"
        }

        # Style configuration
        self.style = ttk.Style(theme='superhero')
        self.style.configure('TLabel', font=('Helvetica', 12))
        self.style.configure('Title.TLabel', font=('Helvetica', 24, 'bold'))
        self.style.configure('Status.TLabel', font=('Helvetica', 24, 'bold'))
        self.style.configure('Good.TLabel', foreground='lightgreen')
        self.style.configure('Poor.TLabel', foreground='salmon')
        self.style.configure('Angle.TLabel', font=('Consolas', 11))

        # Main container
        self.main_frame = ttk.Frame(root)
        self.main_frame.pack(fill=BOTH, expand=YES, padx=10, pady=10)

        # Left panel (video feed)
        self.left_frame = ttk.Frame(self.main_frame)
        self.left_frame.pack(side=LEFT, fill=BOTH, expand=YES)

        # Right panel (stats)
        self.right_frame = ttk.Frame(self.main_frame, width=350)
        self.right_frame.pack(side=RIGHT, fill=Y, expand=NO, padx=(10, 0))

        # Loading screen
        self.loading_label = ttk.Label(
            self.left_frame, text="Initializing system...", style='Title.TLabel')
        self.loading_label.pack(pady=200)

        # Initialize UI after a short delay to prevent freezing
        self.root.after(100, self._initialize_ui)

    def _initialize_ui(self):
            """Initialize the UI components after the main window is ready"""
            try:
                # Remove loading screen
                self.loading_label.destroy()

                # Title
                ttk.Label(self.left_frame, text="Upryt - Posture Monitoring System",
                        style='Title.TLabel').pack(pady=(0, 15))

                # Language selector
                self.language = ttk.StringVar(value="English")
                lang_frame = ttk.Frame(self.left_frame)
                lang_frame.pack(fill=X, pady=5)
                ttk.Label(lang_frame, text="Language:").pack(side=LEFT, padx=5)
                ttk.OptionMenu(lang_frame, self.language, "English",
                            "English", "Nepali").pack(side=LEFT)

                # Status display
                self.status_frame = ttk.Labelframe(self.left_frame,
                                                text="Posture Status",
                                                padding=10)
                self.status_frame.pack(fill=X, pady=10)

                self.status_var = ttk.StringVar(value="Initializing...")
                self.angle_var = ttk.StringVar(value="Angle data will appear here")

                ttk.Label(self.status_frame, text="Current Status:").grid(
                    row=0, column=0, sticky=W, padx=(0, 5))
                self.status_label = ttk.Label(
                    self.status_frame,
                    textvariable=self.status_var,
                    style='Status.TLabel',
                    width=25,
                    anchor="center"
                )
                self.status_label.grid(row=0, column=1, sticky=W)

                # Feedback label for detailed issues
                self.feedback_var = ttk.StringVar(value="")
                self.feedback_frame = ttk.Frame(self.status_frame)
                self.feedback_frame.grid(
                    row=3, column=0, columnspan=2, sticky=EW, pady=(5, 0))

                self.feedback_label = ttk.Label(
                    self.feedback_frame,
                    textvariable=self.feedback_var,
                    font=('arial', 20, 'italic'),
                    foreground='yellow',
                    padding=10,
                    wraplength=1000,
                    anchor="w",
                    justify="left"
                )
                self.feedback_label.pack(fill=X)

                ttk.Label(self.status_frame,
                        text="Body Angles (Shoulder, Neck, Spine, Symmetry) + Distance:").grid(
                    row=1, column=0, columnspan=2, sticky=W, pady=(10, 2))

                self.angle_display = ttk.Label(
                    self.status_frame,
                    textvariable=self.angle_var,
                    style='Angle.TLabel',
                    relief=SOLID,
                    padding=5,
                    width=60,
                    anchor="w",
                    wraplength=500
                )
                self.angle_display.grid(
                    row=2, column=0, columnspan=2, sticky=EW, pady=5)

                # Video feed
                self.video_frame = ttk.Labelframe(
                    self.left_frame,
                    text="Live Camera Feed",
                    padding=(200, 50, 50, 10)
                )
                self.video_frame.pack(fill=BOTH, expand=YES)
                self.video_label = ttk.Label(self.video_frame)
                self.video_label.pack(fill=BOTH, expand=YES)

                # Right panel content
                self.stats_frame = ttk.Labelframe(
                    self.right_frame,
                    text="Session Statistics",
                    padding=10
                )
                self.stats_frame.pack(fill=BOTH, expand=YES, pady=(0, 10))

                self.segment_duration = 10
                self.last_segment_time = None
                self.session_segments = []  # Will hold dictionaries with detailed stats

                # Statistics variables
                self.stats_vars = {
                    "Session Time": ttk.StringVar(value="0s"),
                    "Good Posture Time": ttk.StringVar(value="0s"),
                    "Poor Posture Time": ttk.StringVar(value="0s"),
                    "Corrections": ttk.StringVar(value="0"),
                    "Posture Changes": ttk.StringVar(value="0"),
                    "Current Streak": ttk.StringVar(value="0s (Good)"),
                    "Max Good Streak": ttk.StringVar(value="0s"),
                    "Max Poor Streak": ttk.StringVar(value="0s"),
                    "Good Posture %": ttk.StringVar(value="0%")
                }

                # Create stats labels
                for i, (text, var) in enumerate(self.stats_vars.items()):
                    ttk.Label(self.stats_frame, text=text + ":", anchor="w",
                            width=20).grid(row=i, column=0, sticky=W, padx=5, pady=3)
                    ttk.Label(self.stats_frame, textvariable=var, width=10, anchor="w",
                            style='TLabel').grid(row=i, column=1, sticky=E, padx=5, pady=3)

                # Progress bar for good posture percentage
                self.progress_frame = ttk.Frame(self.right_frame)
                self.progress_frame.pack(fill=X, pady=(10, 0))
                ttk.Label(self.progress_frame,
                        text="Posture Score:").pack(anchor=W)
                self.progress = ttk.Progressbar(
                    self.progress_frame,
                    orient=HORIZONTAL,
                    length=300,
                    mode='determinate',
                    bootstyle=(SUCCESS, STRIPED)
                )
                self.progress.pack(fill=X, pady=(5, 10))

                # Export buttons
                btn_frame = ttk.Frame(self.right_frame)
                btn_frame.pack(fill=X, pady=(10, 0))

                ttk.Button(
                    btn_frame,
                    text="Export CSV",
                    command=self.export_stats,
                    bootstyle=INFO
                ).pack(side=LEFT, fill=X, expand=YES, padx=5)

                ttk.Button(
                    btn_frame,
                    text="Export PDF",
                    command=self.export_pdf,
                    bootstyle=INFO
                ).pack(side=LEFT, fill=X, expand=YES, padx=5)

                # System variables
                self.bad_posture_start = None
                self.alert_cooldown = 1
                self.last_alert_time = 0
                self.session_active = False
                self.start_time = None
                self.good_posture_time = 0
                self.bad_posture_time = 0
                self.last_posture = None
                self.posture_change_time = None
                self.correction_count = 0
                self.posture_change_count = 0
                self.max_good_streak = 0
                self.max_poor_streak = 0
                self.segment_good_time = 0
                self.segment_poor_time = 0
                self.current_streak_start = None
                self.current_streak_type = None

                # Add NLP UI elements
                self._add_nlp_ui()

                # Start NLP initialization in background
                self.root.after(500, lambda: threading.Thread(target=self._initialize_nlp, daemon=True).start())

                # Start video capture
                self.update_video()
            except Exception as e:
                print(f"UI initialization error: {e}")
                self.status_var.set(f"Error: {str(e)}")
    def _initialize_nlp(self):
        """Initialize NLP components without blocking the UI"""
        try:
            print("Initializing NLP modules...")
            self.nlp_initialized = False

            try:
                self.feedback_gen = NLPFeedbackGenerator()
                print("✓ Feedback Generator Loaded")
            except Exception as e:
                print("❌ Feedback Generator failed:", e)
                raise

            try:
                self.sentiment_analyzer = PostureSentimentAnalyzer()
                print("✓ Sentiment Analyzer Loaded")
            except Exception as e:
                print("❌ Sentiment Analyzer failed:", e)
                raise

            try:
                self.summary_generator = DailySummaryGenerator()
                print("✓ Summary Generator Loaded")
            except Exception as e:
                print("❌ Summary Generator failed:", e)
                raise

            # Dummy test
            test_feedback = self.feedback_gen.generate_feedback(
                {'shoulder': 80, 'neck': 25, 'spine': 140},
                {'shoulder_angle': {'mean': 90, 'std': 5},
                'neck_angle': {'mean': 30, 'std': 5},
                'spine_angle': {'mean': 145, 'std': 5}}
            )
            print("Test feedback:", test_feedback)

            self.nlp_initialized = True
            self.root.after(0, self._enable_nlp_features)

        except Exception as e:
            print("NLP initialization failed:", e)
            self.root.after(0, self._disable_nlp_features)

    def _enable_nlp_features(self):
        print("Enabling NLP UI elements")
        try:
            self.submit_btn.config(state='normal')
            self.summary_btn.config(state='normal')
            self.feedback_response.config(text="System ready")
        except Exception as e:
            print(f"Error enabling NLP features: {e}")

    def _disable_nlp_features(self):
        """Disable NLP-related UI elements"""
        try:
            self.submit_btn.config(state='disabled')
            self.summary_btn.config(state='disabled')
            self.feedback_response.config(text="NLP system unavailable")
        except Exception as e:
            print(f"Error disabling NLP features: {e}")

    def _add_nlp_ui(self):
            """Add UI elements for NLP features"""
            # Feedback entry panel
            self.feedback_panel = ttk.Labelframe(
                self.right_frame,
                text="Your Feedback",
                padding=10
            )
            self.feedback_panel.pack(fill=X, pady=10)

            self.feedback_entry = ttk.Entry(self.feedback_panel)
            self.feedback_entry.pack(fill=X, pady=5)

            self.submit_btn = ttk.Button(
                self.feedback_panel,
                text="Submit Feedback",
                command=self._process_feedback,
                state='disabled'  # Disabled until NLP is ready
            )
            self.submit_btn.pack(pady=5)

            self.feedback_response = ttk.Label(
                self.feedback_panel,
                text="NLP system initializing...",
                wraplength=300
            )
            self.feedback_response.pack(fill=X)

            # Daily summary panel
            self.summary_panel = ttk.Labelframe(
                self.right_frame,
                text="Daily Summary",
                padding=10
            )
            self.summary_panel.pack(fill=BOTH, expand=YES, pady=10)

            self.summary_btn = ttk.Button(
                self.summary_panel,
                text="Generate Today's Summary",
                command=self._generate_summary,
                state='disabled'  # Disabled until NLP is ready
            )
            self.summary_btn.pack(pady=5)

            self.summary_text = ttk.Text(
                self.summary_panel,
                height=8,
                wrap=WORD,
                state='disabled'
            )
            self.summary_text.pack(fill=BOTH, expand=YES)

            self.summary_image = ttk.Label(self.summary_panel)
            self.summary_image.pack()



    def _process_feedback(self):
            if not self.nlp_initialized:
                self.feedback_response.config(
                    text="Please wait, system initializing...")
                return

            feedback = self.feedback_entry.get().strip()
            if not feedback:
                self.feedback_response.config(text="Please enter feedback")
                return

            try:
                with self.nlp_lock:
                    print(f"Processing feedback: {feedback}")
                    result = self.sentiment_analyzer.analyze_response(feedback)
                    print(f"Sentiment result: {result}")
                    self.feedback_response.config(text=result['response'])
            except Exception as e:
                print(f"Feedback error: {e}")
                self.feedback_response.config(text="Error processing feedback")
            finally:
                self.feedback_entry.delete(0, 'end')


    def _generate_summary(self):
            if not self.nlp_initialized:
                self.summary_text.config(state='normal')
                self.summary_text.delete(1.0, 'end')
                self.summary_text.insert(
                    'end', "Please wait, system initializing...")
                self.summary_text.config(state='disabled')
                return

            try:
                with self.nlp_lock:
                    session_data = {
                        'total_duration': time.time() - self.start_time,
                        'good_percent': self.progress['value'],
                        'corrections': self.correction_count,
                        'max_good_streak': self.max_good_streak,
                        'good_time': self.good_posture_time,
                        'poor_time': self.bad_posture_time,
                        'common_issue': self._get_most_common_issue()
                    }
                    print(f"Generating summary with: {session_data}")

                    summary = self.summary_generator.generate_summary(session_data)
                    print(f"Generated summary: {summary}")

                    self.summary_text.config(state='normal')
                    self.summary_text.delete(1.0, 'end')
                    self.summary_text.insert('end', summary['text'])
                    self.summary_text.config(state='disabled')

            except Exception as e:
                print(f"Summary error: {e}")
                self.summary_text.config(state='normal')
                self.summary_text.delete(1.0, 'end')
                self.summary_text.insert('end', f"Error generating summary: {e}")
                self.summary_text.config(state='disabled')

    def _get_most_common_issue(self):
        """Determine most frequent posture issue"""
        # Implement your logic here
        return "shoulder alignment"

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

        # Start session timer when first frame arrives
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

        # Update UI
        self.status_var.set(posture_status)
        self.status_label.configure(
            style='Good.TLabel' if posture_status == "Good Posture" else 'Poor.TLabel')

        angle_text = f"Shoulder: {shoulder_angle:.1f}° | Neck: {neck_angle:.1f}°\n"
        angle_text += f"Spine: {spine_angle:.1f}° | Symmetry Δ: {symmetry_diff:.1f}°\n"
        angle_text += f"Eye Distance: {eye_distance:.1f}px ({distance_status})"
        self.angle_var.set(angle_text)

        # Add status text to video frame
        display_frame = cv2.putText(frame.copy(), posture_status, (10, 30),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1,
                                    (0, 255, 0) if posture_status == "Good Posture" else (0, 0, 255), 2)

        global latest_gui_frame
        latest_gui_frame = display_frame.copy()


        # Convert to PhotoImage
        img = Image.fromarray(cv2.cvtColor(display_frame, cv2.COLOR_BGR2RGB))
        imgtk = ImageTk.PhotoImage(image=img)
        self.video_label.imgtk = imgtk
        self.video_label.configure(image=imgtk)

        # Update statistics
        now = time.time()
        session_duration = now - self.start_time

        # Update posture times
        if posture_status == "Good Posture":
            self.good_posture_time += 0.1
        else:
            self.bad_posture_time += 0.1

        # Handle posture changes and streaks
        if posture_status != self.last_posture:
            self.posture_change_count += 1
            self.stats_vars["Posture Changes"].set(
                str(self.posture_change_count))

            # Update streaks
            if posture_status == "Good Posture":
                streak_duration = now - self.current_streak_start
                if self.current_streak_type == "Poor":
                    if streak_duration > self.max_poor_streak:
                        self.max_poor_streak = streak_duration
                        self.stats_vars["Max Poor Streak"].set(
                            f"{int(streak_duration)}s")
            else:
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
        self.stats_vars["Max Good Streak"].set(f"{int(self.max_good_streak)}s")
        self.stats_vars["Max Poor Streak"].set(f"{int(self.max_poor_streak)}s")

        # Update progress bar
        # Update progress bar and stats if session is active
        if session_duration > 0:
            good_percentage = int(
                (self.good_posture_time / session_duration) * 100)
            self.stats_vars["Good Posture %"].set(f"{good_percentage}%")
            self.progress['value'] = good_percentage
            self.progress.configure(
                bootstyle=SUCCESS if good_percentage > 50 else DANGER)

            # Realtime backend update every 1 second
            if not hasattr(self, 'last_backend_send'):
                self.last_backend_send = 0

            if time.time() - self.last_backend_send > 1:
                posture_score = good_percentage  # use it directly or refine later
                payload = {
                    "posture": posture_status,
                    "shoulder_angle": round(shoulder_angle, 2),
                    "neck_angle": round(neck_angle, 2),
                    "spine_angle": round(spine_angle, 2),
                    "symmetry_score": round(symmetry_diff, 2),
                    "eye_distance": round(eye_distance, 2),
                    "posture_score": posture_score,
                    "session": {
                        "session_time": int(session_duration),
                        "good_posture_time": int(self.good_posture_time),
                        "poor_posture_time": int(self.bad_posture_time),
                        "corrections": self.correction_count,
                        "posture_changes": self.posture_change_count,
                        "current_streak": int(now - self.current_streak_start),
                        "max_good_streak": int(self.max_good_streak),
                        "max_poor_streak": int(self.max_poor_streak),
                        "good_posture_percent": good_percentage
                    }
                }

                self.send_data_to_backend(payload)
                self.last_backend_send = time.time()

        

        self.root.after(100, self.update_video)

    def on_close(self):
        self.cap.release()
        self.root.destroy()



    def generate_posture_charts(self):
        times = [seg["Time"] for seg in self.session_segments]
        good = [seg["Good Time"] for seg in self.session_segments]
        poor = [seg["Poor Time"] for seg in self.session_segments]
        good_percent = [seg["Good %"] for seg in self.session_segments]

        # Line Chart
        plt.figure(figsize=(10, 5))
        plt.plot(times, good_percent, marker='o', color='seagreen',
                    linewidth=2, label='Good Posture %')
        plt.title("Posture Trend Over Time")
        plt.xlabel("Time")
        plt.ylabel("Good Posture %")
        plt.ylim(0, 100)
        plt.grid(True, linestyle='--', alpha=0.5)
        plt.legend()
        plt.tight_layout()
        plt.savefig("posture_trend_over_time.png")
        plt.close()

        # Bar Chart
        x = np.arange(len(times))
        width = 0.4

        plt.figure(figsize=(10, 5))
        plt.bar(x - width/2, good, width, label='Good', color='green')
        plt.bar(x + width/2, poor, width, label='Poor', color='red')
        plt.xticks(x, times, rotation=45)
        plt.xlabel('Time (s)')
        plt.ylabel('Time in Segment (s)')
        plt.title('Good vs Poor Posture')
        plt.legend()
        plt.tight_layout()
        plt.savefig("bar_chart.png")
        plt.close()

        # Pie chart
        total_good = sum(good)
        total_poor = sum(poor)
        plt.figure(figsize=(5, 5))
        plt.pie([total_good, total_poor], labels=["Good", "Poor"],
                autopct='%1.1f%%', colors=["lightgreen", "salmon"])
        plt.title("Total Posture Distribution")
        plt.tight_layout()
        plt.savefig("pie_chart.png")
        plt.close()

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


    def on_close(self):
            """Clean up resources before closing"""
            self.running = False
            if hasattr(self, 'cap') and self.cap.isOpened():
                self.cap.release()
            if hasattr(self, 'feedback_gen'):
                del self.feedback_gen
            if hasattr(self, 'sentiment_analyzer'):
                del self.sentiment_analyzer
            if hasattr(self, 'summary_generator'):
                del self.summary_generator
            self.root.destroy()

    def _get_summary_data(self):
        return {
            'total_duration': time.time() - self.start_time,
            'good_percent': self.progress['value'],
            'corrections': self.correction_count,
            'max_good_streak': self.max_good_streak,
            'good_time': self.good_posture_time,
            'poor_time': self.bad_posture_time,
            'common_issue': self._get_most_common_issue()
        }





def start_flask():
    time.sleep(1)  # Delay to avoid thread clash with GUI/NLP
    flask_app.run(port=5001, debug=False, use_reloader=False)

if __name__ == "__main__":
    # Start Flask server thread
    flask_thread = threading.Thread(target=start_flask, daemon=True)
    flask_thread.start()

    # Start GUI
    root = ttk.Window(title="Upryt", themename="darkly")
    app = PostureApp(root)
    posture_monitor = app  # ✅ Add this global reference for Flask access
    root.protocol("WM_DELETE_WINDOW", app.on_close)
    root.mainloop()
