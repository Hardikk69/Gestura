import cv2
from fastapi.responses import FileResponse
import redis
import pickle
import shutil
import numpy as np
import mediapipe as mp
from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile


class Login(BaseModel):
    name: str
    password: str

class Register(BaseModel):
    name: str
    email: str
    password: str
    confirm_password: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8100","http://192.168.89.106:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

redis_client_login = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
redis_client_register = redis.Redis(host="localhost", port=6379, db=1, decode_responses=True)

def get_all_users(redis_client):
    users = []
    for key in redis_client.keys():
        user_data = redis_client.hgetall(key)
        if user_data:
            users.append(user_data)
    return users

@app.get("/register")
def read_all_users_register():
    return {"users": get_all_users(redis_client_register)}

@app.get("/login")
def read_all_users_login():
    return {"users": get_all_users(redis_client_login)}

@app.post("/register")
def create_user(user: Register): 
    timestamp = datetime.utcnow().isoformat() 
    redis_client_register.hset(user.name, "password", user.password)
    redis_client_register.hset(user.name, "email", user.email)
    redis_client_register.hset(user.name, "confirm_password", user.confirm_password)
    redis_client_register.hset(user.name, "registered_at", timestamp)
    return {"message": "User registered successfully", "registered_at": timestamp}

@app.post("/login")
def login_user(user: Login):
    timestamp = datetime.utcnow().isoformat() 
    redis_client_login.hset(user.name, "password", user.password)
    redis_client_login.hset(user.name, "logged_at", timestamp)
    return {"message": "User logged in successfully", "logged_at": timestamp}

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, min_detection_confidence=0.6)

labels_dict = {i: chr(65 + i) for i in range(26)}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # ✅ Save the received image temporarily
        temp_file = "received_frame.jpg"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # ✅ Read the image with OpenCV
        frame = cv2.imread(temp_file)
        if frame is None:
            return {"error": "❌ Failed to read the image. Ensure it is a valid format."}

        # Convert frame to RGB
        H, W, _ = frame.shape
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        results = hands.process(frame_rgb)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                x_ = [lm.x for lm in hand_landmarks.landmark]
                y_ = [lm.y for lm in hand_landmarks.landmark]
                data_aux = [(lm.x - min(x_)) for lm in hand_landmarks.landmark] + \
                           [(lm.y - min(y_)) for lm in hand_landmarks.landmark]

                if len(data_aux) != 42:
                    return {"error": "❌ Invalid landmark count."}

                # ✅ Load Model
                try:
                    model_dict = pickle.load(open('./model.p', 'rb'))
                    model = model_dict['model']
                except Exception as e:
                    return {"error": f"❌ Model loading failed: {str(e)}"}

                prediction = model.predict([np.asarray(data_aux)])
                predicted_character = labels_dict.get(int(prediction[0]), "?")

                # ✅ Draw Bounding Box Around Hand
                x1, y1 = int(min(x_) * W), int(min(y_) * H)
                x2, y2 = int(max(x_) * W), int(max(y_) * H)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 3)  # Green bounding box
                cv2.putText(frame, predicted_character, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

                # ✅ Save the processed image with bounding box
                processed_file = "processed_frame.jpg"
                cv2.imwrite(processed_file, frame)

                return {
                    "prediction": predicted_character,
                    "image_url": f"http://localhost:8000/processed_image"
                }

        return {"error": "❌ No hand detected."}

    except Exception as e:
        return {"error": f"❌ Server error: {str(e)}"}

# ✅ Serve the processed image
@app.get("/processed_image")
def get_processed_image():
    return FileResponse("processed_frame.jpg", media_type="image/jpeg")