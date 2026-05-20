import os
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from livekit.api import AccessToken, VideoGrants

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/token")
def get_token():
    token = AccessToken(os.environ["LIVEKIT_API_KEY"], os.environ["LIVEKIT_API_SECRET"])
    token.with_identity(f"user-{uuid.uuid4()}")
    token.with_name("Student")
    token.with_grants(VideoGrants(room_join=True, room=f"ace-{uuid.uuid4()}"))
    return {"token": token.to_jwt(), "url": os.environ["LIVEKIT_URL"]}


@app.get("/health")
def health():
    return {"status": "ok"}
