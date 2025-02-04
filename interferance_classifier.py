import pickle
import cv2
import mediapipe as mp
import numpy as np

# Load the trained model
model_dict = pickle.load(open('./model.p', 'rb'))
model = model_dict['model']

cap = cv2.VideoCapture(0)

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

hands = mp_hands.Hands(static_image_mode=False, min_detection_confidence=0.3)

# Label mapping
labels_dict = {i: chr(65 + i) for i in range(26)}  # A-Z mapping

frame_count = 0  # Initialize frame counter

while True:
    data_aux = []
    x_ = []
    y_ = []

    ret, frame = cap.read()
    if not ret or frame is None:
        print("Failed to capture frame.")
        continue  

    H, W, _ = frame.shape
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = hands.process(frame_rgb)
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS,
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style())

            # Ensure only 21 landmarks are processed
            if len(hand_landmarks.landmark) != 21:
                print(f"⚠️ Skipping frame: Only {len(hand_landmarks.landmark)} landmarks detected instead of 21!")
                continue  

            # Collect landmark coordinates
            for landmark in hand_landmarks.landmark:
                x_.append(landmark.x)
                y_.append(landmark.y)

            for landmark in hand_landmarks.landmark:
                data_aux.append(landmark.x - min(x_))  # Normalize x
                data_aux.append(landmark.y - min(y_))  # Normalize y

        # Final feature validation
        if len(data_aux) != 42:
            print(f"Skipping frame: Incorrect feature size {len(data_aux)} instead of 42!")
            continue  

        # Get bounding box
        x1 = int(min(x_) * W) - 10
        y1 = int(min(y_) * H) - 10
        x2 = int(max(x_) * W) - 10
        y2 = int(max(y_) * H) - 10

        # Predict the character
        prediction = model.predict([np.asarray(data_aux)])
        predicted_character = labels_dict.get(int(prediction[0]), "?")

        # Draw the results
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 0), 4)
        cv2.putText(frame, predicted_character, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 0, 0), 3, cv2.LINE_AA)

        # Increment frame count
        frame_count += 1

        # Print letter every 100 frames
        if frame_count % 20 == 0:
            print(f"🆕 Detected Letter (Frame {frame_count}): {predicted_character}")

    cv2.imshow('frame', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
