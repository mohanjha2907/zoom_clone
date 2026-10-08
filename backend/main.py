from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json

from database import engine, Base
from routers import meetings, participants
from seed import seed_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and seed DB on startup
    Base.metadata.create_all(bind=engine)
    seed_db()
    yield
    # Cleanup on shutdown can go here

app = FastAPI(title="Zoom Clone API", lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(meetings.router)
app.include_router(participants.router)

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        # meeting_code -> list of active WebSockets
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, meeting_code: str):
        await websocket.accept()
        if meeting_code not in self.active_connections:
            self.active_connections[meeting_code] = []
        self.active_connections[meeting_code].append(websocket)

    def disconnect(self, websocket: WebSocket, meeting_code: str):
        if meeting_code in self.active_connections:
            self.active_connections[meeting_code].remove(websocket)
            if not self.active_connections[meeting_code]:
                del self.active_connections[meeting_code]

    async def broadcast(self, message: dict, meeting_code: str):
        if meeting_code in self.active_connections:
            for connection in self.active_connections[meeting_code]:
                await connection.send_text(json.dumps(message))

manager = ConnectionManager()

@app.websocket("/ws/{meeting_code}")
async def websocket_endpoint(websocket: WebSocket, meeting_code: str):
    await manager.connect(websocket, meeting_code)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Broadcast the event (chat message, mute event, etc)
            await manager.broadcast({
                "type": message_data.get("type", "message"),
                "sender": message_data.get("sender", "Unknown"),
                "content": message_data.get("content", ""),
            }, meeting_code)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, meeting_code)
        await manager.broadcast({
            "type": "leave",
            "content": "A user has left the meeting."
        }, meeting_code)

@app.get("/")
def read_root():
    return {"message": "Welcome to Zoom Clone API"}
