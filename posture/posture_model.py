import cv2
import mediapipe as mp
import numpy as np
import csv
import time

mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
cap = cv2.VideoCapture(0)

data = []
print("Collecting data. Press 'g' for good posture, 'p' for poor, 'q' to quit.")

def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba, bc = a - b, c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-7)
    return np.degrees(np.arccos(np.clip(cosine_angle, -1.0, 1.0)))

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(image)

    if results.pose_landmarks:
        lms = results.pose_landmarks.landmark
        l_sh = [lms[mp_pose.PoseLandmark.LEFT_SHOULDER].x, lms[mp_pose.PoseLandmark.LEFT_SHOULDER].y]
        r_sh = [lms[mp_pose.PoseLandmark.RIGHT_SHOULDER].x, lms[mp_pose.PoseLandmark.RIGHT_SHOULDER].y]
        l_ear = [lms[mp_pose.PoseLandmark.LEFT_EAR].x, lms[mp_pose.PoseLandmark.LEFT_EAR].y]

        mid_sh = [(l_sh[0] + r_sh[0]) / 2, (l_sh[1] + r_sh[1]) / 2]

        shoulder_angle = calculate_angle(l_sh, r_sh, [r_sh[0], 0])
        neck_angle = calculate_angle(l_ear, l_sh, [l_sh[0], 0])

        key = cv2.waitKey(1) & 0xFF
        if key == ord('g'):
            print("Logged good posture")
            data.append([shoulder_angle, neck_angle, "good"])
        elif key == ord('p'):
            print("Logged poor posture")
            data.append([shoulder_angle, neck_angle, "poor"])
        elif key == ord('q'):
            break

cap.release()

with open("posture_data.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["shoulder_angle", "neck_angle", "label"])
    writer.writerows(data)

print("Data saved to posture_data.csv")