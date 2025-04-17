import cv2
from fastapi.responses import FileResponse
import redis
import pickle
import shutil
import numpy as np
import mediapipe as mp
from fastapi import Body, FastAPI
from pydantic import BaseModel, EmailStr
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile
from fastapi import HTTPException

class Login(BaseModel):
    name: str
    password: str

class Register(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    print(f"Received data: {user}")

    if redis_client_register.exists(user.name):
        raise HTTPException(status_code=400, detail="❌ Username already taken.")
    
    timestamp = datetime.utcnow().isoformat()
    redis_client_register.hset(user.name, "name", user.name)
    redis_client_register.hset(user.name, "password", user.password)
    redis_client_register.hset(user.name, "email", user.email)
    redis_client_register.hset(user.name, "confirm_password", user.confirm_password)
    redis_client_register.hset(user.name, "registered_at", timestamp)
    return {"message": "✅ User registered successfully", "registered_at": timestamp}

@app.post("/login")
def login_user(user: Login):
    if not redis_client_register.exists(user.name):
        raise HTTPException(status_code=400, detail="❌ User not registered.")
    stored_password = redis_client_register.hget(user.name, "password")
    if stored_password != user.password:
        raise HTTPException(status_code=400, detail="❌ Incorrect password.")

    timestamp = datetime.utcnow().isoformat() 
    redis_client_login.hset(user.name, "password", user.password)
    redis_client_login.hset(user.name, "logged_at", timestamp)
    return {"message": "✅ User logged in successfully", "logged_at": timestamp, "redirect": "/main"}

model_dict = pickle.load(open('./model.p', 'rb'))
model = model_dict['model']

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
hands = mp_hands.Hands(static_image_mode=True, min_detection_confidence=0.3)

labels_dict = {i: chr(65 + i) for i in range(26)}

@app.post("/main")
async def predict(file: UploadFile = File(...)):
    try:
        temp_file = "received_frame.jpg"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        frame = cv2.imread(temp_file)
        if frame is None:
            return {"error": "❌ Invalid image file."}

        H, W, _ = frame.shape
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(frame_rgb)

        if results.multi_hand_landmarks:
            data_aux = []
            x_ = []
            y_ = []

            for hand_landmarks in results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(
                    frame, 
                    hand_landmarks, 
                    mp_hands.HAND_CONNECTIONS,
                    mp_drawing_styles.get_default_hand_landmarks_style(),
                    mp_drawing_styles.get_default_hand_connections_style()
                )

                for landmark in hand_landmarks.landmark:
                    x_.append(landmark.x)
                    y_.append(landmark.y)

                if len(x_) != 21:
                    return {"error": f"Invalid number of landmarks: {len(x_)}"}

                for landmark in hand_landmarks.landmark:
                    data_aux.append(landmark.x - min(x_))
                    data_aux.append(landmark.y - min(y_))

                if len(data_aux) != 42:
                    return {"error": "Invalid feature size"}

                prediction = model.predict([np.asarray(data_aux)])
                predicted_character = labels_dict.get(int(prediction[0]), "?")

                x1 = int(min(x_) * W) - 10
                y1 = int(min(y_) * H) - 10
                x2 = int(max(x_) * W) + 10
                y2 = int(max(y_) * H) + 10

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 3)
                cv2.putText(frame, predicted_character, (x1, y1 - 10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 255, 0), 3, cv2.LINE_AA)

                print(f"✅ Detected Letter: {predicted_character}")

                cv2.imwrite("processed_frame.jpg", frame)
                return {
                    "prediction": predicted_character,
                    "image_url": "http://localhost:8000/processed_image"
                }

        return {"error": "❌ No hand detected."}

    except Exception as e:
        return {"error": f"Server error: {str(e)}"}

@app.get("/processed_image")
def get_processed_image():
    return FileResponse("processed_frame.jpg", media_type="image/jpeg")

@app.delete("/delete/{username}")
def delete_user(username: str):
    if not redis_client_register.exists(username):
        raise HTTPException(status_code=404, detail="❌ User not found.")
    redis_client_register.delete(username)
    return {"message": "✅ User deleted successfully."}


@app.get("/users")
def get_users():
    all_users = []
    for key in redis_client_register.scan_iter():
        user_data = redis_client_register.hgetall(key)
        user_info = {
            "name": key,
            "email": user_data.get("email"),
            "password": user_data.get("password")
        }
        all_users.append(user_info)
    return all_users
