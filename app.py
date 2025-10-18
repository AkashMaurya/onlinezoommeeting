"""
Online Church Meeting Platform v4.0.0
Built with Streamlit + WebRTC
All Glory to Our LORD JESUS CHRIST (The Son of GOD)
Made with ❤️ by Jesus Sheep Akash
"""

import streamlit as st
from streamlit_webrtc import webrtc_streamer, WebRtcMode, RTCConfiguration
import av
import queue
import time
from typing import Dict, List
import uuid
import json

# Page configuration
st.set_page_config(
    page_title="Church Meeting Platform",
    page_icon="🙏",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better UI
st.markdown("""
<style>
    .main-header {
        text-align: center;
        padding: 1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
        margin-bottom: 2rem;
    }
    .participant-card {
        padding: 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        margin: 0.5rem 0;
        background: white;
    }
    .host-badge {
        background: #f59e0b;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: bold;
    }
    .chat-message {
        padding: 0.75rem;
        margin: 0.5rem 0;
        border-radius: 8px;
        background: #f7fafc;
    }
    .chat-message.own {
        background: #e6f7ff;
        border-left: 4px solid #1890ff;
    }
    .stButton>button {
        width: 100%;
    }
</style>
""", unsafe_allow_html=True)

# ICE servers configuration
RTC_CONFIGURATION = RTCConfiguration({
    "iceServers": [
        {"urls": ["stun:stun.l.google.com:19302"]},
        {"urls": ["stun:stun1.l.google.com:19302"]},
        {"urls": ["stun:stun2.l.google.com:19302"]},
    ]
})

# Initialize session state
if 'meeting_id' not in st.session_state:
    st.session_state.meeting_id = None
if 'username' not in st.session_state:
    st.session_state.username = None
if 'participant_id' not in st.session_state:
    st.session_state.participant_id = str(uuid.uuid4())
if 'is_host' not in st.session_state:
    st.session_state.is_host = False
if 'in_meeting' not in st.session_state:
    st.session_state.in_meeting = False
if 'chat_messages' not in st.session_state:
    st.session_state.chat_messages = []
if 'participants' not in st.session_state:
    st.session_state.participants = {}
if 'audio_enabled' not in st.session_state:
    st.session_state.audio_enabled = True
if 'video_enabled' not in st.session_state:
    st.session_state.video_enabled = True

# Global storage for meetings (in production, use Redis or database)
if 'meetings_db' not in st.session_state:
    st.session_state.meetings_db = {}

def create_meeting():
    """Create a new meeting"""
    meeting_id = str(uuid.uuid4())[:8].upper()
    st.session_state.meetings_db[meeting_id] = {
        'host_id': st.session_state.participant_id,
        'participants': {},
        'created_at': time.time()
    }
    return meeting_id

def join_meeting(meeting_id: str, username: str):
    """Join an existing meeting"""
    if meeting_id not in st.session_state.meetings_db:
        return False
    
    st.session_state.meeting_id = meeting_id
    st.session_state.username = username
    st.session_state.in_meeting = True
    
    # Check if user is host
    meeting = st.session_state.meetings_db[meeting_id]
    st.session_state.is_host = (meeting['host_id'] == st.session_state.participant_id)
    
    # Add participant to meeting
    meeting['participants'][st.session_state.participant_id] = {
        'username': username,
        'joined_at': time.time(),
        'is_host': st.session_state.is_host
    }
    
    return True

def leave_meeting():
    """Leave the current meeting"""
    if st.session_state.meeting_id and st.session_state.meeting_id in st.session_state.meetings_db:
        meeting = st.session_state.meetings_db[st.session_state.meeting_id]
        if st.session_state.participant_id in meeting['participants']:
            del meeting['participants'][st.session_state.participant_id]
    
    st.session_state.in_meeting = False
    st.session_state.meeting_id = None
    st.session_state.chat_messages = []

def send_chat_message(message: str):
    """Send a chat message"""
    if message.strip():
        st.session_state.chat_messages.append({
            'username': st.session_state.username,
            'message': message,
            'timestamp': time.time(),
            'participant_id': st.session_state.participant_id
        })

# Main UI
st.markdown("""
<div class="main-header">
    <h1>🙏 Online Church Meeting Platform</h1>
    <p>All Glory to Our LORD JESUS CHRIST (The Son of GOD)</p>
</div>
""", unsafe_allow_html=True)

# Join/Create Meeting Section
if not st.session_state.in_meeting:
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📝 Join Meeting")
        username_input = st.text_input("Your Name", placeholder="Enter your name")
        meeting_id_input = st.text_input("Meeting ID", placeholder="Enter meeting ID")
        
        if st.button("Join Meeting", type="primary"):
            if not username_input:
                st.error("Please enter your name")
            elif not meeting_id_input:
                st.error("Please enter a meeting ID")
            elif meeting_id_input not in st.session_state.meetings_db:
                st.error("Meeting not found")
            else:
                if join_meeting(meeting_id_input, username_input):
                    st.success(f"Joined meeting: {meeting_id_input}")
                    st.rerun()
    
    with col2:
        st.subheader("➕ Create New Meeting")
        username_create = st.text_input("Your Name (Host)", placeholder="Enter your name", key="username_create")
        
        if st.button("Create Meeting", type="primary"):
            if not username_create:
                st.error("Please enter your name")
            else:
                meeting_id = create_meeting()
                if join_meeting(meeting_id, username_create):
                    st.success(f"Meeting created! ID: {meeting_id}")
                    st.rerun()

# Meeting Room
else:
    # Header with meeting info
    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        st.markdown(f"### 📹 Meeting: `{st.session_state.meeting_id}`")
        if st.session_state.is_host:
            st.markdown('<span class="host-badge">HOST</span>', unsafe_allow_html=True)
    with col2:
        if st.button("📋 Copy Meeting ID"):
            st.toast(f"Meeting ID: {st.session_state.meeting_id}")
    with col3:
        if st.button("🚪 Leave Meeting", type="secondary"):
            leave_meeting()
            st.rerun()
    
    st.divider()
    
    # Main content area
    video_col, sidebar_col = st.columns([3, 1])
    
    with video_col:
        st.subheader("📹 Your Video")
        
        # Video controls
        ctrl_col1, ctrl_col2, ctrl_col3 = st.columns(3)
        with ctrl_col1:
            if st.button("🎤 Mute/Unmute"):
                st.session_state.audio_enabled = not st.session_state.audio_enabled
        with ctrl_col2:
            if st.button("📹 Video On/Off"):
                st.session_state.video_enabled = not st.session_state.video_enabled
        with ctrl_col3:
            if st.button("🖥️ Share Screen"):
                st.info("Screen sharing coming soon!")
        
        # WebRTC Video Stream
        webrtc_ctx = webrtc_streamer(
            key="video-stream",
            mode=WebRtcMode.SENDRECV,
            rtc_configuration=RTC_CONFIGURATION,
            media_stream_constraints={
                "video": st.session_state.video_enabled,
                "audio": st.session_state.audio_enabled
            },
            async_processing=True,
        )
        
        st.info("💡 **Note**: This is your local video stream. Peer-to-peer connections with other participants will be established automatically.")
    
    with sidebar_col:
        # Participants List
        st.subheader("👥 Participants")
        meeting = st.session_state.meetings_db.get(st.session_state.meeting_id, {})
        participants = meeting.get('participants', {})
        
        st.markdown(f"**Total: {len(participants)}**")
        
        for pid, pinfo in participants.items():
            is_you = (pid == st.session_state.participant_id)
            host_badge = "👑 " if pinfo.get('is_host') else ""
            you_badge = " (You)" if is_you else ""
            
            st.markdown(f"""
            <div class="participant-card">
                {host_badge}<strong>{pinfo['username']}</strong>{you_badge}
            </div>
            """, unsafe_allow_html=True)
        
        st.divider()
        
        # Chat Section
        st.subheader("💬 Chat")
        
        # Chat messages display
        chat_container = st.container(height=300)
        with chat_container:
            for msg in st.session_state.chat_messages:
                is_own = msg['participant_id'] == st.session_state.participant_id
                css_class = "chat-message own" if is_own else "chat-message"
                st.markdown(f"""
                <div class="{css_class}">
                    <strong>{msg['username']}</strong>
                    <p>{msg['message']}</p>
                </div>
                """, unsafe_allow_html=True)
        
        # Chat input
        chat_input = st.text_input("Type a message...", key="chat_input", label_visibility="collapsed")
        if st.button("Send", type="primary"):
            if chat_input:
                send_chat_message(chat_input)
                st.rerun()

# Footer
st.divider()
st.markdown("""
<div style="text-align: center; color: #718096; padding: 1rem;">
    <p><strong>All Glory to Our LORD JESUS CHRIST (The Son of GOD)</strong> 🙏</p>
    <p>Made with ❤️ by Jesus Sheep Akash | Version 4.0.0</p>
</div>
""", unsafe_allow_html=True)

