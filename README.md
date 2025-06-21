# 🧍 Posture Monitor AI

A desktop app using webcam + AI to monitor your sitting posture in real time and give feedback via voice alerts and GUI.

---

## 📦 Features

- Real-time webcam-based posture monitoring
- Alerts if you're too close or too far from the screen
- Detects poor posture based on shoulder, neck, spine, and symmetry angles
- Voice reminders using text-to-speech
- Custom AI model (`posture_model.pkl`) trained from your own body data


---

## 🚀 How to Use

### 1. 🔧 Install Requirements

Run in terminal

In terminal (inside the folder):

pip install -r requirements.txt


---
 collect_data.py
 collects data for good and bad pasture:
 Sit in a good posture → press g
 Sit in a poor posture → press p

 ---
  train_model.py
  This trains a classifier and saves: posture_model.pkl
  You'll see the accuracy and a classification report in terminal

---
posture.py
Shows live webcam feed

Gives angle values and distance info

Alerts if posture or distance is bad

---
Tech Used
Python

OpenCV

MediaPipe

Scikit-learn

Tkinter GUI

pyttsx3 (Text-to-Speech)

