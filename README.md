# 🎥 Online Church Meeting Platform

An open-source video meeting platform built with WebRTC, FastAPI, and modern web technologies. Designed for church prayer meetings with professional Google Meet/Zoom-inspired UI.

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

- 🎥 **Video Conferencing**: Real-time video and audio communication using WebRTC
- 💬 **Live Chat**: Real-time chat with timestamps and unread indicators
- 😊 **Emoji Reactions**: Floating emoji reactions (👍 ❤️ 😂 👏 🎉 🔥)
- 🎤 **Audio Recording**: Client-side audio recording with local WAV file saving
- 👥 **Multi-User Support**: Up to 100 concurrent participants
- 🔇 **Participant Indicators**: See who's muted or has video off
- ⏱️ **Meeting Timer**: Live meeting duration counter
- 📱 **Grid/Speaker View**: Toggle between layout modes
- 🔗 **Easy Sharing**: Simple meeting links for quick joining
- 🎨 **Professional UI**: Google Meet/Zoom-inspired dark theme
- 🚀 **No Authentication**: Quick and easy access
- 📱 **Mobile Responsive**: Works on phones, tablets, and desktops

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, WebRTC
- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **Libraries**:
  - SimplePeer (WebRTC wrapper)
  - RecordRTC (Audio recording)
  - Adapter.js (WebRTC compatibility)

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
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Open your browser**
   Navigate to `http://localhost:8000`

### Testing Locally

1. Open multiple browser windows/tabs
2. Create a meeting in one window
3. Copy the meeting ID
4. Join from other windows using the same meeting ID
5. Test video, audio, and recording features

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
     - **Name**: video-meeting-platform (or your choice)
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free

3. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Access your app at the provided URL (e.g., `https://your-app.onrender.com`)

### Environment Variables (Optional)

You can add these in Render's dashboard:
- `PORT`: Automatically set by Render
- `DATABASE_URL`: For external database (if needed)

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

## Acknowledgments

- WebRTC for real-time communication
- FastAPI for the excellent Python framework
- SimplePeer for WebRTC abstraction
- RecordRTC for recording capabilities

---

Built with ❤️ using open-source technologies

