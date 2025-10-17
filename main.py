from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uuid
import json
from typing import Dict, Set
import logging
from database import Database
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Online Church Meeting Platform")

# Initialize database
db = Database()

# Store active WebSocket connections
# Structure: {meeting_id: {participant_id: websocket}}
active_connections: Dict[str, Dict[str, WebSocket]] = {}

# Store meeting hosts (creator of each meeting)
# Structure: {meeting_id: host_participant_id}
meeting_hosts: Dict[str, str] = {}

# Store participant usernames
# Structure: {meeting_id: {participant_id: username}}
participant_usernames: Dict[str, Dict[str, str]] = {}

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def read_root():
    """Serve the main HTML page"""
    return FileResponse("static/index.html")


@app.get("/api/create_meeting")
async def create_meeting():
    """Create a new meeting and return the meeting ID"""
    meeting_id = str(uuid.uuid4())[:8]  # Shorter ID for easier sharing
    
    if db.create_meeting(meeting_id):
        logger.info(f"Created meeting: {meeting_id}")
        return {"meeting_id": meeting_id, "status": "created"}
    else:
        raise HTTPException(status_code=500, detail="Failed to create meeting")


@app.get("/api/meeting/{meeting_id}")
async def get_meeting_info(meeting_id: str):
    """Get information about a meeting"""
    if not db.meeting_exists(meeting_id):
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    participant_count = db.get_participant_count(meeting_id)
    participants = db.get_participants(meeting_id)
    
    return {
        "meeting_id": meeting_id,
        "participant_count": participant_count,
        "participants": participants
    }


@app.websocket("/ws/{meeting_id}/{participant_id}")
async def websocket_endpoint(websocket: WebSocket, meeting_id: str, participant_id: str):
    """WebSocket endpoint for WebRTC signaling"""
    await websocket.accept()
    logger.info(f"Participant {participant_id} connecting to meeting {meeting_id}")

    username = "Anonymous"
    is_host = False

    # Create meeting if it doesn't exist
    if not db.meeting_exists(meeting_id):
        db.create_meeting(meeting_id)

    # Add participant to database
    db.add_participant(meeting_id, participant_id)

    # Store WebSocket connection
    if meeting_id not in active_connections:
        active_connections[meeting_id] = {}
        participant_usernames[meeting_id] = {}
        # First participant is the host
        meeting_hosts[meeting_id] = participant_id
        is_host = True
        logger.info(f"Participant {participant_id} is the host of meeting {meeting_id}")

    active_connections[meeting_id][participant_id] = websocket

    # Send list of existing participants to the new participant
    existing_participants = []
    for pid in active_connections[meeting_id].keys():
        if pid != participant_id:
            existing_participants.append({
                "id": pid,
                "username": participant_usernames[meeting_id].get(pid, "Anonymous"),
                "is_host": pid == meeting_hosts.get(meeting_id)
            })

    await websocket.send_json({
        "type": "existing_participants",
        "participants": existing_participants,
        "is_host": is_host,
        "host_id": meeting_hosts.get(meeting_id)
    })
    
    try:
        while True:
            # Receive data from client
            data = await websocket.receive_text()
            message = json.loads(data)
            message_type = message.get("type")

            # Handle username registration
            if message_type == "register_username":
                username = message.get("username", "Anonymous")
                participant_usernames[meeting_id][participant_id] = username

                # Notify all participants about the new participant with username
                await broadcast_to_meeting(
                    meeting_id,
                    {
                        "type": "participant_joined",
                        "participant_id": participant_id,
                        "username": username,
                        "is_host": participant_id == meeting_hosts.get(meeting_id),
                        "participant_count": db.get_participant_count(meeting_id),
                        "timestamp": datetime.now().isoformat()
                    },
                    exclude_participant=participant_id
                )
                logger.info(f"Registered username '{username}' for {participant_id}")

            # Handle chat messages
            elif message_type == "chat":
                await broadcast_to_meeting(
                    meeting_id,
                    {
                        "type": "chat",
                        "from": participant_id,
                        "username": participant_usernames[meeting_id].get(participant_id, "Anonymous"),
                        "message": message.get("message", ""),
                        "timestamp": message.get("timestamp")
                    }
                )
                logger.info(f"Chat message from {participant_id} in meeting {meeting_id}")

            # Handle emoji reactions
            elif message_type == "reaction":
                await broadcast_to_meeting(
                    meeting_id,
                    {
                        "type": "reaction",
                        "from": participant_id,
                        "username": participant_usernames[meeting_id].get(participant_id, "Anonymous"),
                        "emoji": message.get("emoji", "👍")
                    }
                )
                logger.info(f"Reaction {message.get('emoji')} from {participant_id}")

            # Handle participant state changes (mute, video off)
            elif message_type == "participant_state":
                await broadcast_to_meeting(
                    meeting_id,
                    {
                        "type": "participant_state",
                        "from": participant_id,
                        "username": participant_usernames[meeting_id].get(participant_id, "Anonymous"),
                        "video_enabled": message.get("video_enabled", True),
                        "audio_enabled": message.get("audio_enabled", True)
                    },
                    exclude_participant=participant_id
                )

            # Handle recording status announcements
            elif message_type == "recording_status":
                await broadcast_to_meeting(
                    meeting_id,
                    {
                        "type": "recording_status",
                        "status": message.get("status"),
                        "participant_id": participant_id
                    }
                )
                logger.info(f"Recording {message.get('status')} by {participant_id}")

            # Handle host control commands
            elif message_type == "host_control":
                # Verify sender is the host
                if participant_id == meeting_hosts.get(meeting_id):
                    target_id = message.get("target_id")
                    action = message.get("action")

                    if target_id and target_id in active_connections[meeting_id]:
                        target_ws = active_connections[meeting_id][target_id]
                        await target_ws.send_json({
                            "type": "host_control",
                            "action": action,
                            "value": message.get("value"),
                            "from_host": True
                        })
                        logger.info(f"Host {participant_id} sent control '{action}' to {target_id}")
                else:
                    logger.warning(f"Non-host {participant_id} attempted host control")

            # Forward WebRTC signaling messages to target participant
            elif "target" in message:
                target_id = message["target"]
                if meeting_id in active_connections and target_id in active_connections[meeting_id]:
                    target_ws = active_connections[meeting_id][target_id]
                    message["from"] = participant_id
                    message["from_username"] = participant_usernames[meeting_id].get(participant_id, "Anonymous")
                    await target_ws.send_json(message)
                    logger.debug(f"Forwarded {message_type} from {participant_id} to {target_id}")

            # Broadcast other messages to all participants
            else:
                await broadcast_to_meeting(
                    meeting_id,
                    message,
                    exclude_participant=participant_id
                )
    
    except WebSocketDisconnect:
        logger.info(f"Participant {participant_id} disconnected from meeting {meeting_id}")
    except Exception as e:
        logger.error(f"Error in WebSocket connection: {e}")
    finally:
        # Get username before cleanup
        left_username = participant_usernames.get(meeting_id, {}).get(participant_id, "Anonymous")

        # Clean up on disconnect
        if meeting_id in active_connections:
            active_connections[meeting_id].pop(participant_id, None)

            # Remove meeting from active connections if empty
            if not active_connections[meeting_id]:
                active_connections.pop(meeting_id, None)
                participant_usernames.pop(meeting_id, None)
                meeting_hosts.pop(meeting_id, None)
            else:
                # Remove username
                if meeting_id in participant_usernames:
                    participant_usernames[meeting_id].pop(participant_id, None)

        # Remove participant from database
        db.remove_participant(meeting_id, participant_id)

        # Notify remaining participants with username
        await broadcast_to_meeting(
            meeting_id,
            {
                "type": "participant_left",
                "participant_id": participant_id,
                "username": left_username,
                "participant_count": db.get_participant_count(meeting_id),
                "timestamp": datetime.now().isoformat()
            }
        )


async def broadcast_to_meeting(meeting_id: str, message: dict, exclude_participant: str = None):
    """Broadcast a message to all participants in a meeting"""
    if meeting_id not in active_connections:
        return
    
    disconnected = []
    for participant_id, websocket in active_connections[meeting_id].items():
        if participant_id == exclude_participant:
            continue
        
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending to {participant_id}: {e}")
            disconnected.append(participant_id)
    
    # Clean up disconnected participants
    for participant_id in disconnected:
        active_connections[meeting_id].pop(participant_id, None)
        db.remove_participant(meeting_id, participant_id)


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "active_meetings": len(active_connections),
        "total_participants": sum(len(participants) for participants in active_connections.values())
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

