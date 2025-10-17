# Quick Start Guide

Get your video meeting platform running in 5 minutes!

## 🚀 Super Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 3. Open browser
# Navigate to: http://localhost:8000
```

That's it! 🎉

## 📋 What You Get

- ✅ Video conferencing with WebRTC
- ✅ Audio recording (saves as WAV)
- ✅ Support for up to 100 users
- ✅ Easy meeting creation and sharing
- ✅ No authentication required
- ✅ Mobile-friendly interface

## 🎯 Basic Usage

### Create a Meeting

1. Open `http://localhost:8000`
2. Click **"Create New Meeting"**
3. Allow camera/microphone access
4. Share the meeting link with others

### Join a Meeting

1. Open the shared link or enter meeting ID
2. Click **"Join Meeting"**
3. Allow camera/microphone access
4. Start communicating!

### Controls

- **📹 Video On/Off**: Toggle your camera
- **🎤 Audio On/Off**: Toggle your microphone
- **⏺️ Start Recording**: Record audio locally
- **⏹️ Stop Recording**: Save recording as WAV file
- **📞 Leave**: Exit the meeting

## 🧪 Test with Multiple Users

### Option 1: Multiple Browser Windows
```bash
# Open multiple windows of the same browser
# Join the same meeting from each window
```

### Option 2: Different Browsers
```bash
# Open Chrome, Firefox, Edge, etc.
# Join the same meeting from each browser
```

### Option 3: Multiple Devices
```bash
# On your computer: http://localhost:8000
# On your phone: http://YOUR_LOCAL_IP:8000
# (Find your IP: ipconfig on Windows, ifconfig on Mac/Linux)
```

## 📁 Project Structure

```
meeting/
├── main.py              # FastAPI backend
├── database.py          # SQLite database
├── requirements.txt     # Python dependencies
├── static/
│   ├── index.html      # Frontend UI
│   ├── app.js          # WebRTC logic
│   └── style.css       # Styling
└── README.md           # Full documentation
```

## 🔧 Configuration

### Change Port

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 3000
```

### Production Mode (No Auto-Reload)

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Multiple Workers (Better Performance)

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🌐 Deploy to Internet

### Quick Deploy to Render (Free)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repo
   - Use these settings:
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Click "Create Web Service"

3. **Done!** Your app is live at `https://your-app.onrender.com`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🐛 Troubleshooting

### Camera/Microphone Not Working
- Check browser permissions
- Ensure no other app is using them
- Try a different browser

### Can't See Other Participants
- Check browser console for errors
- Verify both users are in the same meeting
- Check firewall settings

### Server Won't Start
```bash
# Check if port is already in use
# Windows:
netstat -ano | findstr :8000

# Mac/Linux:
lsof -i :8000

# Kill the process or use a different port
```

### Database Errors
```bash
# Delete and recreate database
rm meetings.db
# Restart server - database will be recreated automatically
```

## 📚 Learn More

- **Full Documentation**: [README.md](README.md)
- **Testing Guide**: [TESTING.md](TESTING.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

## 🎓 How It Works

### Architecture

```
┌─────────────┐         ┌─────────────┐
│   Browser   │◄───────►│   Browser   │
│  (Client 1) │         │  (Client 2) │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │  WebSocket (Signaling)│
       │                       │
       └───────┬───────────────┘
               │
        ┌──────▼──────┐
        │   FastAPI   │
        │   Server    │
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │   SQLite    │
        │  Database   │
        └─────────────┘
```

### WebRTC Flow

1. **Signaling**: Clients exchange connection info via WebSocket
2. **Peer Connection**: Direct peer-to-peer connection established
3. **Media Streaming**: Video/audio flows directly between peers
4. **Recording**: Client-side audio recording using RecordRTC

## 🔐 Security Notes

⚠️ **This is a demo/development setup**

For production use, add:
- User authentication
- Meeting passwords
- HTTPS (required for WebRTC)
- Rate limiting
- Input validation

## 💡 Tips

### Better Video Quality
- Use good lighting
- Stable internet connection
- Close unnecessary applications
- Use wired connection if possible

### Better Audio Quality
- Use headphones to prevent echo
- Use external microphone if available
- Minimize background noise
- Mute when not speaking

### Performance
- Limit to 10-20 participants for best experience
- Close unused browser tabs
- Use modern browser (Chrome recommended)
- Ensure sufficient bandwidth

## 🎨 Customization

### Change Colors
Edit `static/style.css`:
```css
/* Change primary color */
.btn-primary {
    background: #your-color;
}
```

### Change Title
Edit `static/index.html`:
```html
<title>Your Custom Title</title>
<h1>🎥 Your Custom Name</h1>
```

### Add Features
Edit `static/app.js` for frontend logic
Edit `main.py` for backend logic

## 📊 Monitoring

### Check Server Health
```bash
curl http://localhost:8000/api/health
```

### View Active Meetings
```bash
# Open SQLite database
sqlite3 meetings.db

# Query meetings
SELECT * FROM meetings;

# Query participants
SELECT * FROM participants;
```

### Monitor Logs
Server logs show:
- WebSocket connections
- Participant joins/leaves
- Errors and warnings

## 🚀 Next Steps

1. ✅ Test locally with friends
2. ✅ Customize the UI
3. ✅ Deploy to Render
4. ✅ Share with the world!
5. ✅ Add more features
6. ✅ Contribute to the project

## 🤝 Contributing

Found a bug? Have a feature idea?
- Open an issue on GitHub
- Submit a pull request
- Share your feedback

## 📝 License

MIT License - Free to use and modify!

## 🎉 Have Fun!

You now have your own video meeting platform!

Share it with friends, use it for team meetings, or build upon it to create something amazing!

---

**Need help?** Check the full [README.md](README.md) or open an issue on GitHub.

**Ready to deploy?** See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions.

**Want to test thoroughly?** Follow [TESTING.md](TESTING.md) for comprehensive testing.

