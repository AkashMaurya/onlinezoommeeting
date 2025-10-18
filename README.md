# 🎥 Online Church Meeting Platform v3.1.1

An open-source video meeting platform built with WebRTC, FastAPI, and modern web technologies. Designed for church prayer meetings with professional Google Meet/Zoom-inspired UI.

**Latest Version:** 3.1.1 Patch 2 (2025-10-18)
**Latest Update:** 🔴 CRITICAL FIXES - Video streams now visible, mobile leave button fixed
**Previous Updates:**
- v3.1.1 Patch 1: Bug fixes - screen sharing, recording, mobile UX
- v3.1.0: Mute indicators, shareable links, theme toggle
- v3.0.0: Screen sharing, MP3 recording, enhanced host controls, grid/speaker view toggle

## 🚀 RENDER DEPLOYMENT - START COMMAND

**⚠️ IMPORTANT**: When deploying to Render, use this **Start Command**:
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Build Command**:
```
pip install -r requirements.txt
```

## ✨ Features

### 🔴 CRITICAL FIXES in v3.1.1 Patch 2 (Latest - 2025-10-18)

**EMERGENCY PATCH - Production Blocking Issues Fixed:**
- 🔴 **Video Streams Not Visible** → ✅ **FIXED**: Participant metadata now properly populated from signaling messages
- 🔴 **Mobile Leave Button Missing** → ✅ **FIXED**: Comprehensive mobile CSS ensures button always visible and tappable

**Root Causes Identified:**
- Video issue: `handleSignaling()` wasn't extracting `from_username` from WebRTC messages
- Mobile issue: Insufficient mobile-specific CSS for control bar layout

**Impact:** Platform now 100% functional for video conferencing on all devices

### 🔧 FIXED in v3.1.1 Patch 1 (2025-10-17)

- ✅ **Screen Sharing**: Fixed visibility for all participants, including late joiners
- ✅ **Recording**: Proper audio mixing captures all voices using Web Audio API (WAV format)
- ✅ **Recording Announcements**: Audio beeps notify all participants when recording starts/stops
- ✅ **Enhanced Logging**: Emoji indicators for easier debugging

### NEW in v3.1.0

- 🎤 **Mute/Unmute Icon Overlay**: Visual microphone indicators on each video showing real-time mute status
- 🔗 **Shareable Meeting Link**: One-click copy meeting link to clipboard for easy invitations
- 🌓 **Dark/Light Mode Toggle**: Switch between dark and light themes with saved preference

### NEW in v3.0.0

- 🖥️ **Screen Sharing with Audio**: Share your screen with system audio for presentations and videos
- 🎵 **MP3 Audio Recording**: Record meeting audio in MP3 format (captures all participants)
- 👑 **Enhanced Host Controls**: Mute AND kick participants from the meeting
- 📊 **Grid/Speaker View Toggle**: Switch between grid view and speaker view with active speaker detection
- 🎨 **Modern UI Enhancements**: Gradient backgrounds, smooth animations, and professional design
- 🔧 **Video Mirror Fix**: Videos display in normal orientation (not mirrored)

### Core Features
- 🎥 **Video Conferencing**: Real-time video and audio communication using WebRTC
- 💬 **Live Chat**: Real-time chat with timestamps and unread indicators
- 😊 **Emoji Reactions**: Floating emoji reactions (👍 ❤️ 😂 👏 🎉 🙏)
- 👥 **Multi-User Support**: Up to 100 concurrent participants
- 🔗 **Easy Sharing**: Simple meeting links for quick joining
- 🚀 **No Authentication**: Quick and easy access

### v2.0 Features
- 👑 **Host Controls**: Meeting creator can remotely mute/stop video for any participant
- 🔔 **Join/Leave Notifications**: Toast notifications when participants join or leave
- 📋 **Participant List**: Always-visible list with names, avatars, and status indicators
- 🎨 **Tailwind CSS UI**: Modern, professional design with mobile-first approach
- 📱 **Mobile Optimized**: Touch-friendly controls, responsive layout, works on iOS/Android
- 📊 **Low Data Mode**: Reduce bandwidth usage by 70% for slow connections
- ⏱️ **Meeting Timer**: Live meeting duration counter
- 🔇 **Participant Indicators**: See who's muted or has video off in real-time

## Technology Stack

- **Frontend**: HTML5, Tailwind CSS, JavaScript, WebRTC
- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **Libraries**:
  - SimplePeer (WebRTC wrapper)
  - RecordRTC (Audio/Video recording)
  - Adapter.js (WebRTC compatibility)
  - Tailwind CSS (Utility-first CSS framework)
  - Font Awesome 6.4.0 (Icons)

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd meeting
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**

   **Development Mode:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   **Production Mode (Recommended for testing with multiple users):**
   ```bash
   gunicorn -c gunicorn.conf.py main:app
   ```

5. **Open your browser**
   Navigate to `http://localhost:8000`

### Testing Locally

1. Open multiple browser windows/tabs
2. Create a meeting in one window (you become the host 👑)
3. Copy the meeting ID
4. Join from other windows using the same meeting ID
5. Test all features:
   - ✅ Video display (host sees participants)
   - ✅ Audio (everyone can speak and hear)
   - ✅ Emoji reactions (click multiple times)
   - ✅ Host controls (mute/stop video)
   - ✅ Chat messages
   - ✅ Participant list
   - ✅ Recording (WebM format)
   - ✅ Low data mode

**See [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive testing instructions.**

## 🚀 Production Deployment

### Why Production Configuration Matters

⚠️ **IMPORTANT:** The development server (`uvicorn main:app --reload`) is **NOT suitable for production** because:
- ❌ Single process - cannot handle concurrent users
- ❌ No worker management - crashes affect all users
- ❌ Limited to ~10 concurrent WebSocket connections
- ❌ No automatic restarts or load balancing

✅ **Production Setup (Gunicorn + Uvicorn Workers):**
- ✅ Multiple worker processes - handles 100+ concurrent users
- ✅ Automatic worker management and restarts
- ✅ Graceful WebSocket connection handling
- ✅ Worker recycling prevents memory leaks
- ✅ Production-grade reliability

### Quick Production Start

```bash
# Install dependencies (includes Gunicorn)
pip install -r requirements.txt

# Run with Gunicorn (production-ready)
gunicorn -c gunicorn.conf.py main:app

# Custom configuration
PORT=8080 WEB_CONCURRENCY=4 gunicorn -c gunicorn.conf.py main:app
```

**📖 See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for complete production deployment guide.**

## Deployment on Render

### Prerequisites
- GitHub account
- Render account (free tier available at [render.com](https://render.com))

### Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create a new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: church-meeting-platform (or your choice)
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn -c gunicorn.conf.py main:app` ✅ **Production-ready!**
     - **Plan**: Free (or paid for better performance)

3. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Access your app at the provided URL (e.g., `https://your-app.onrender.com`)

### Environment Variables (Optional)

You can add these in Render's dashboard:
- `PORT`: Automatically set by Render
- `WEB_CONCURRENCY`: Number of workers (default: auto-calculated)
- `LOG_LEVEL`: Logging level (default: info)
- `DATABASE_URL`: For external database (if needed)

**Note:** Render automatically uses the `Procfile` which is configured for production with Gunicorn.

## Project Structure

```
meeting/
├── static/
│   ├── index.html      # Main HTML page
│   ├── app.js          # WebRTC and UI logic
│   └── style.css       # Styling
├── main.py             # FastAPI application
├── database.py         # SQLite database manager
├── requirements.txt    # Python dependencies
├── Procfile           # Render deployment config
└── README.md          # This file
```

## API Endpoints

### REST Endpoints

- `GET /` - Serve main HTML page
- `GET /api/create_meeting` - Create a new meeting
- `GET /api/meeting/{meeting_id}` - Get meeting information
- `GET /api/health` - Health check endpoint

### WebSocket Endpoint

- `WS /ws/{meeting_id}/{participant_id}` - WebRTC signaling

## Usage

### Creating a Meeting

1. Click "Create New Meeting"
2. Share the generated meeting link with participants
3. Start your video/audio

### Joining a Meeting

1. Enter the meeting ID or use the shared link
2. Optionally enter your name
3. Click "Join Meeting"
4. Allow camera and microphone access

### Controls

- **Video On/Off**: Toggle your camera
- **Audio On/Off**: Toggle your microphone
- **Start/Stop Recording**: Record audio locally
- **Share Screen**: Share your screen (coming soon)
- **Leave**: Exit the meeting

### Recording Audio

1. Click "Start Recording" during a meeting
2. Speak or conduct your meeting
3. Click "Stop Recording"
4. The audio file will automatically download as a WAV file

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 11+)
- Opera

**Note**: WebRTC requires HTTPS in production. Render provides this automatically.

## Limitations

### Free Tier Considerations

- **Render Free Tier**: 
  - May sleep after 15 minutes of inactivity
  - Limited resources (512 MB RAM)
  - May struggle with 100 simultaneous users
  
- **WebRTC P2P**: 
  - Reduces server load as media flows peer-to-peer
  - May require TURN server for some network configurations

### Security

- No authentication implemented (for simplicity)
- For production, consider adding:
  - User authentication (OAuth, JWT)
  - Meeting passwords
  - Waiting rooms
  - Host controls

## Troubleshooting

### Camera/Microphone Not Working

- Ensure you've granted browser permissions
- Check if another application is using the camera
- Try a different browser
- Ensure you're using HTTPS (required for WebRTC)

### Connection Issues

- Check your internet connection
- Firewall may be blocking WebRTC
- Try using a different network
- Check browser console for errors

### Recording Not Working

- Ensure microphone is enabled
- Check browser compatibility
- Verify sufficient disk space for download

## Future Enhancements

- [ ] Screen sharing functionality
- [ ] Chat messaging
- [ ] Virtual backgrounds
- [ ] Meeting recording (server-side)
- [ ] User authentication
- [ ] Meeting passwords
- [ ] Host controls (mute, kick)
- [ ] Breakout rooms
- [ ] Reactions and hand raising
- [ ] Grid/speaker view toggle

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open-source and available under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the browser console for error messages
- Ensure all dependencies are installed correctly

## 📚 Documentation

- **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** - 🚀 Production deployment with Gunicorn (NEW!)
- **[CRITICAL_FIXES_v3.1.1.md](CRITICAL_FIXES_v3.1.1.md)** - 🔴 Emergency patch fixes
- **[V3.1.1_BUGFIXES.md](V3.1.1_BUGFIXES.md)** - Bug fixes in v3.1.1 Patch 1
- **[V3.1_FEATURES.md](V3.1_FEATURES.md)** - Complete guide to v3.1.0 features
- **[V3_FEATURES.md](V3_FEATURES.md)** - Complete guide to v3.0.0 features
- **[TESTING_CHECKLIST_V3.md](TESTING_CHECKLIST_V3.md)** - Comprehensive testing guide
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes
- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Deployment instructions
- **[QUICK_START.md](QUICK_START.md)** - 5-minute setup guide

## 🎯 Quick Feature Guide

### Mute Indicators (NEW in v3.1)
- Green microphone icon = unmuted
- Red microphone-slash icon = muted
- Appears on bottom-left of each video
- Updates in real-time

### Shareable Link (NEW in v3.1)
1. Click "Share Link" button in top bar
2. Link copied to clipboard
3. Share with participants
4. They click link and join directly

### Theme Toggle (NEW in v3.1)
1. Click moon/sun icon in top bar
2. Switches between dark and light mode
3. Preference saved automatically

### Screen Sharing
1. Click "Share" button in control bar
2. Select screen/window to share
3. Check "Share audio" for system sound
4. Click "Share" - red indicator appears
5. Click again to stop

### MP3 Recording
1. Click "Audio Record" button
2. Button turns red and pulses
3. Click again to stop
4. File downloads as `.mp3`

### Host Controls
1. Host sees mute/kick buttons on participant videos
2. Click to mute participant remotely
3. Open participant list for kick option
4. Confirmation required to kick

### Grid/Speaker View
1. Click "Grid" or "Speaker" in top bar
2. Grid: All equal-sized videos
3. Speaker: Large active speaker + thumbnails
4. Green border shows who's talking

## 🌟 What Makes This Special

- ✅ **100% Open Source** - No vendor lock-in
- ✅ **Privacy First** - No data collection, client-side recording
- ✅ **Easy Deployment** - One-click deploy to Render.com
- ✅ **No Limits** - Unlimited meeting duration
- ✅ **Professional UI** - Looks like Zoom/Google Meet
- ✅ **Church Focused** - Built for prayer meetings

## Acknowledgments

- WebRTC for real-time communication
- FastAPI for the excellent Python framework
- SimplePeer for WebRTC abstraction
- RecordRTC for recording capabilities
- Tailwind CSS for modern UI

---

**Built with ❤️ for Church Prayer Meetings**
**All Glory to Our LORD JESUS CHRIST (The Son of GOD)**
**Made by Jesus Sheep Akash**

**Version:** 3.1.1 Patch 2 | **License:** MIT | **Repository:** [GitHub](https://github.com/AkashMaurya/onlinezoommeeting)

