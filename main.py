import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import redis

# Define a model for User data
class User(BaseModel):
    name: str
    password: str

class Fruit(BaseModel):
    name: str

class Fruits(BaseModel):
    fruits: list[Fruit]

app = FastAPI()

origins = [
    "http://localhost:8100"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Correct Redis connection
redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

@app.get("/")
def read_root():
    redis_client.set("message", "Hello from Redis!")
    return {"message": redis_client.get("message")}

# Endpoint to receive name and password in the request body
@app.post("/login")
def create_user(user: User):
    # Store the user data in Redis or any other logic you want
    redis_client.set(user.name, user.password)
    return {"message": f"User {user.name} added successfully!"}

memory_db = {"fruits": []}

@app.get("/fruits")
def get_fruits():
    return Fruits(fruits=memory_db["fruits"])

@app.post("/fruits")
def create_fruits(fruits: Fruits):
    memory_db["fruits"].extend(fruits.fruits)
    return {"message": "Fruits added successfully!", "data": fruits.fruits}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
