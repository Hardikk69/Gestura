import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

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

# In-memory database
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
