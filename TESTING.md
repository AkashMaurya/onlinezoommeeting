# Testing Guide

This guide will help you test the Video Meeting Platform locally before deployment.

## Prerequisites

- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Edge, or Safari)
- Microphone and camera (for full testing)

## Local Testing Steps

### 1. Start the Server

```bash
# Make sure you're in the project directory
cd meeting

# Activate virtual environment (if using one)
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see output like:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 2. Test Basic Functionality

#### Test 1: Health Check
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{"status":"healthy","active_meetings":0,"total_participants":0}
```

#### Test 2: Create Meeting
```bash
curl http://localhost:8000/api/create_meeting
```

Expected response:
```json
{"meeting_id":"abc12345","status":"created"}
```

### 3. Test Web Interface

#### Single User Test

1. Open browser and navigate to `http://localhost:8000`
2. Click "Create New Meeting"
3. Allow camera and microphone access when prompted
4. Verify:
   - ✅ Your video appears in the grid
   - ✅ Meeting ID is displayed
   - ✅ Participant count shows "1"
   - ✅ Share link is generated

#### Multi-User Test

1. **First User:**
   - Open `http://localhost:8000` in Chrome
   - Click "Create New Meeting"
   - Copy the meeting ID or share link

2. **Second User:**
   - Open `http://localhost:8000` in Firefox (or Chrome Incognito)
   - Paste the meeting ID
   - Click "Join Meeting"
   - Allow camera/microphone access

3. **Verify:**
   - ✅ Both users can see each other's video
   - ✅ Participant count shows "2"
   - ✅ Audio is working (speak and listen)
   - ✅ Video quality is acceptable

4. **Third User (Optional):**
   - Repeat step 2 in another browser/tab
   - Verify all three participants can see each other

### 4. Test Controls

#### Video Toggle
1. Click "Video On" button
2. Verify:
   - ✅ Button changes to "Video Off"
   - ✅ Your video feed stops
   - ✅ Other participants see your video stop
3. Click again to re-enable

#### Audio Toggle
1. Click "Audio On" button
2. Verify:
   - ✅ Button changes to "Audio Off"
   - ✅ Your microphone is muted
   - ✅ Other participants can't hear you
3. Click again to re-enable

#### Recording
1. Click "Start Recording"
2. Speak for 10-15 seconds
3. Click "Stop Recording"
4. Verify:
   - ✅ A WAV file downloads automatically
   - ✅ File name format: `meeting-{id}-{timestamp}.wav`
   - ✅ Audio plays correctly when opened

#### Leave Meeting
1. Click "Leave" button
2. Verify:
   - ✅ You return to the join screen
   - ✅ Camera/microphone are released
   - ✅ Other participants see participant count decrease

### 5. Test Edge Cases

#### Test: Join Non-Existent Meeting
1. Enter a random meeting ID
2. Click "Join Meeting"
3. Verify:
   - ✅ Meeting is created automatically
   - ✅ You can join successfully

#### Test: Rejoin After Leaving
1. Create and join a meeting
2. Leave the meeting
3. Join the same meeting again
4. Verify:
   - ✅ Can rejoin successfully
   - ✅ New participant ID is assigned

#### Test: Network Disconnect
1. Join a meeting with 2+ participants
2. Disconnect internet briefly
3. Reconnect
4. Verify:
   - ✅ WebSocket reconnects (may need manual refresh)
   - ✅ Participant count updates correctly

#### Test: Browser Refresh
1. Join a meeting
2. Refresh the browser
3. Verify:
   - ✅ Returns to join screen
   - ✅ Can rejoin the meeting

### 6. Performance Testing

#### Test: Multiple Participants
1. Open 5-10 browser tabs/windows
2. Join the same meeting from all tabs
3. Monitor:
   - CPU usage
   - Memory usage
   - Video/audio quality
   - Latency

Expected results:
- ✅ CPU usage increases but remains manageable
- ✅ All participants can see/hear each other
- ✅ No significant lag or freezing

#### Test: Long Duration
1. Join a meeting
2. Leave it running for 30+ minutes
3. Verify:
   - ✅ Connection remains stable
   - ✅ No memory leaks
   - ✅ Audio/video quality consistent

### 7. Browser Compatibility

Test on multiple browsers:

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | Latest  | ✅     |
| Firefox | Latest  | ✅     |
| Edge    | Latest  | ✅     |
| Safari  | 11+     | ✅     |
| Opera   | Latest  | ✅     |

### 8. Mobile Testing

1. Access `http://<your-local-ip>:8000` from mobile device
2. Test on both iOS and Android
3. Verify:
   - ✅ Responsive design works
   - ✅ Camera/microphone access works
   - ✅ Video quality is acceptable
   - ✅ Controls are usable on touch screen

### 9. Database Testing

Check SQLite database:

```bash
# Install sqlite3 if not available
# On Windows: Download from sqlite.org
# On Mac: brew install sqlite
# On Linux: sudo apt-get install sqlite3

# Open database
sqlite3 meetings.db

# Check tables
.tables

# View meetings
SELECT * FROM meetings;

# View participants
SELECT * FROM participants;

# Exit
.quit
```

### 10. API Testing

Test all endpoints:

```bash
# Create meeting
curl http://localhost:8000/api/create_meeting

# Get meeting info (replace {meeting_id})
curl http://localhost:8000/api/meeting/{meeting_id}

# Health check
curl http://localhost:8000/api/health
```

## Common Issues and Solutions

### Issue: Camera/Microphone Not Working
**Solution:**
- Check browser permissions
- Ensure no other app is using the camera
- Try a different browser
- Check if HTTPS is required (some browsers require it)

### Issue: Can't See Other Participants
**Solution:**
- Check browser console for errors
- Verify WebSocket connection is established
- Check firewall settings
- Ensure both users are in the same meeting

### Issue: Audio Echo
**Solution:**
- Use headphones
- Ensure local video is muted
- Check audio settings in browser

### Issue: High CPU Usage
**Solution:**
- Reduce number of participants
- Lower video quality in browser settings
- Close other applications
- Use a more powerful device

### Issue: Recording Not Downloading
**Solution:**
- Check browser download settings
- Ensure pop-ups are not blocked
- Try a different browser
- Check disk space

## Automated Testing (Optional)

For automated testing, you can use:

```python
# test_api.py
import requests

BASE_URL = "http://localhost:8000"

def test_health():
    response = requests.get(f"{BASE_URL}/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_create_meeting():
    response = requests.get(f"{BASE_URL}/api/create_meeting")
    assert response.status_code == 200
    data = response.json()
    assert "meeting_id" in data
    assert data["status"] == "created"

if __name__ == "__main__":
    test_health()
    test_create_meeting()
    print("All tests passed!")
```

Run with:
```bash
pip install requests
python test_api.py
```

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] No console errors in browser
- [ ] Database is working correctly
- [ ] WebSocket connections are stable
- [ ] Recording functionality works
- [ ] Multiple users can join successfully
- [ ] Performance is acceptable with 10+ users
- [ ] Mobile devices work correctly
- [ ] All browsers are compatible
- [ ] README.md is up to date
- [ ] .gitignore excludes sensitive files
- [ ] requirements.txt is complete

## Next Steps

Once local testing is complete:
1. Commit your code to Git
2. Push to GitHub
3. Deploy to Render (see README.md)
4. Test the deployed version
5. Share with users!

## Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs
3. Review this testing guide
4. Open an issue on GitHub

