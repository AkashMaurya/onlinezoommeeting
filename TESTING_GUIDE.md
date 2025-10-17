# Testing Guide - Online Church Meeting Platform v2.0

## 🧪 Complete Testing Checklist

### Prerequisites
- [ ] Server is running on http://localhost:8000
- [ ] At least 2 devices/browsers available for testing
- [ ] Camera and microphone permissions granted
- [ ] Stable internet connection

---

## 1. CRITICAL BUG FIXES VERIFICATION

### Test 1.1: Video Display (Host Can See Participants) ✅
**Bug**: Meeting creator couldn't see participant videos

**Test Steps**:
1. Open Browser 1 (Chrome)
2. Enter name: "Host User"
3. Click "Create New Meeting"
4. Allow camera/microphone
5. Note the meeting ID
6. Open Browser 2 (Firefox/Edge)
7. Enter name: "Participant 1"
8. Enter the meeting ID
9. Click "Join Meeting"
10. Allow camera/microphone

**Expected Result**:
- ✅ Host sees their own video
- ✅ Host sees Participant 1's video
- ✅ Participant 1 sees their own video
- ✅ Participant 1 sees Host's video
- ✅ Both videos are playing (not frozen)
- ✅ Participant count shows "2" in both browsers

**Pass Criteria**: All 6 checkmarks must be ✅

---

### Test 1.2: Audio Functionality (Participants Can Speak) ✅
**Bug**: Participants couldn't speak - microphones not working

**Test Steps**:
1. Continue from Test 1.1 (2 users in meeting)
2. In Browser 1 (Host): Speak into microphone
3. In Browser 2 (Participant): Listen for audio
4. In Browser 2 (Participant): Speak into microphone
5. In Browser 1 (Host): Listen for audio
6. Check audio indicators (waveforms if visible)

**Expected Result**:
- ✅ Host can hear Participant speaking
- ✅ Participant can hear Host speaking
- ✅ No echo or feedback
- ✅ Audio is clear (not distorted)
- ✅ No delay > 1 second

**Pass Criteria**: All 5 checkmarks must be ✅

**Troubleshooting**:
- If no audio: Check browser permissions
- If echo: Ensure local video is muted
- If delay: Check network connection

---

### Test 1.3: Emoji Reactions (Work Multiple Times) ✅
**Bug**: Reactions only worked once then stopped

**Test Steps**:
1. Continue from Test 1.2 (2 users in meeting)
2. In Browser 1: Click reactions button (😊)
3. Click 👍 emoji
4. Wait 3 seconds for animation to complete
5. Click reactions button again
6. Click ❤️ emoji
7. Repeat 3 more times with different emojis
8. In Browser 2: Do the same test

**Expected Result**:
- ✅ First reaction appears and floats up
- ✅ Second reaction appears and floats up
- ✅ Third reaction appears and floats up
- ✅ Fourth reaction appears and floats up
- ✅ Fifth reaction appears and floats up
- ✅ All reactions visible to both users
- ✅ Reactions picker closes after each selection
- ✅ Reactions picker can be reopened unlimited times

**Pass Criteria**: All 8 checkmarks must be ✅

---

## 2. NEW FEATURES TESTING

### Test 2.1: Host Controls (Mute/Stop Video) ✅

**Test Steps**:
1. Browser 1 (Host): Look for "Host" badge in top navigation
2. Browser 1 (Host): Hover over Participant 1's video
3. Browser 1 (Host): Click microphone-slash button
4. Browser 2 (Participant): Check if microphone is muted
5. Browser 1 (Host): Click video-slash button
6. Browser 2 (Participant): Check if video is stopped

**Expected Result**:
- ✅ Host badge visible in Browser 1
- ✅ Host controls (mute/video buttons) visible on participant video
- ✅ Clicking mute button mutes participant
- ✅ Participant sees "Host has muted your microphone" notification
- ✅ Participant's microphone button turns red
- ✅ Clicking video button stops participant's video
- ✅ Participant sees "Host has stopped your video" notification
- ✅ Participant's video button turns red

**Pass Criteria**: All 8 checkmarks must be ✅

---

### Test 2.2: Participant Notifications ✅

**Test Steps**:
1. Browser 1 (Host): Already in meeting
2. Browser 2 (Participant 1): Already in meeting
3. Open Browser 3
4. Enter name: "Participant 2"
5. Enter meeting ID
6. Click "Join Meeting"
7. Watch Browser 1 and Browser 2 for notifications
8. In Browser 3: Click "Leave Meeting"
9. Watch Browser 1 and Browser 2 for notifications

**Expected Result**:
- ✅ "Participant 2 joined the meeting" toast appears in Browser 1
- ✅ "Participant 2 joined the meeting" toast appears in Browser 2
- ✅ Toast has blue background and info icon
- ✅ Toast auto-dismisses after 4 seconds
- ✅ Participant count updates to "3"
- ✅ "Participant 2 left the meeting" toast appears after leaving
- ✅ Participant count updates to "2"

**Pass Criteria**: All 7 checkmarks must be ✅

---

### Test 2.3: Participant List ✅

**Test Steps**:
1. Continue with 2 users in meeting
2. In Browser 1: Click participant count button (top right)
3. Verify participant list opens
4. Check list contents
5. In Browser 2: Mute microphone
6. In Browser 1: Check participant list for mute indicator
7. Close participant list

**Expected Result**:
- ✅ Participant list panel opens
- ✅ Shows "Host User (You)" with Host badge
- ✅ Shows "Participant 1" 
- ✅ Each participant has avatar with first letter
- ✅ Host has amber/orange avatar
- ✅ Mute indicator appears when participant mutes
- ✅ Video-off indicator appears when participant stops video
- ✅ List updates in real-time

**Pass Criteria**: All 8 checkmarks must be ✅

---

### Test 2.4: Chat System ✅

**Test Steps**:
1. In Browser 1: Click chat button
2. Type "Hello from host"
3. Press Enter
4. In Browser 2: Check if message appears
5. In Browser 2: Click chat button
6. Type "Hello from participant"
7. Press Enter
8. In Browser 1: Check if message appears
9. Close chat in Browser 1
10. Send message from Browser 2
11. Check unread badge in Browser 1

**Expected Result**:
- ✅ Chat panel opens on right side
- ✅ Message appears in own chat immediately
- ✅ Message appears in other user's chat
- ✅ Sender name shows correctly
- ✅ Timestamp shows correctly
- ✅ Own messages have blue background
- ✅ Other messages have gray background
- ✅ Unread badge appears when chat is closed
- ✅ Unread count is accurate
- ✅ Badge disappears when chat is opened

**Pass Criteria**: All 10 checkmarks must be ✅

---

### Test 2.5: Recording (WebM Format) ✅

**Test Steps**:
1. In Browser 1: Click record button
2. Wait 10 seconds
3. Speak into microphone
4. Click stop recording button
5. Check download folder
6. Verify file format and size

**Expected Result**:
- ✅ Record button turns red and pulses
- ✅ "Recording started" notification appears
- ✅ Button shows stop icon
- ✅ After stopping, file downloads automatically
- ✅ Filename format: `church-meeting-[ID]-[timestamp].webm`
- ✅ File size is reasonable (< 5MB for 10 seconds)
- ✅ File can be played in media player
- ✅ Audio quality is good

**Pass Criteria**: All 8 checkmarks must be ✅

---

### Test 2.6: Low Data Mode ✅

**Test Steps**:
1. In Browser 1: Click signal icon (top right)
2. Observe video quality change
3. Check notification
4. Click signal icon again to disable
5. Observe video quality restore

**Expected Result**:
- ✅ Button highlights in blue when active
- ✅ "Low data mode enabled" notification appears
- ✅ Video quality visibly reduces
- ✅ Video becomes slightly grayscale
- ✅ Frame rate reduces (less smooth)
- ✅ Clicking again disables mode
- ✅ "Low data mode disabled" notification appears
- ✅ Video quality restores to normal

**Pass Criteria**: All 8 checkmarks must be ✅

---

## 3. MOBILE TESTING

### Test 3.1: Mobile Browser (iOS Safari) 📱

**Test Steps**:
1. Open Safari on iPhone
2. Navigate to http://[your-server-ip]:8000
3. Create or join meeting
4. Allow camera/microphone permissions
5. Test all features

**Expected Result**:
- ✅ Page loads correctly
- ✅ Layout is mobile-optimized
- ✅ Buttons are large enough to tap (48x48px)
- ✅ Video grid shows 1 column
- ✅ Chat goes full-screen
- ✅ Participant list goes full-screen
- ✅ All controls accessible
- ✅ No zoom on double-tap
- ✅ Orientation change works
- ✅ Recording works and downloads

**Pass Criteria**: All 10 checkmarks must be ✅

---

### Test 3.2: Mobile Browser (Android Chrome) 📱

**Test Steps**:
1. Open Chrome on Android phone
2. Navigate to http://[your-server-ip]:8000
3. Create or join meeting
4. Allow camera/microphone permissions
5. Test all features

**Expected Result**:
- ✅ Page loads correctly
- ✅ Layout is mobile-optimized
- ✅ Buttons are large enough to tap
- ✅ Video works (front and back camera)
- ✅ Audio works
- ✅ Chat works
- ✅ Reactions work
- ✅ Recording works
- ✅ Low data mode works
- ✅ No performance issues

**Pass Criteria**: All 10 checkmarks must be ✅

---

## 4. STRESS TESTING

### Test 4.1: Multiple Participants (5+ Users)

**Test Steps**:
1. Open 5 different browsers/devices
2. All join the same meeting
3. Test video/audio with all participants
4. Test chat with multiple messages
5. Test reactions from all users
6. Monitor performance

**Expected Result**:
- ✅ All 5 participants can see each other
- ✅ All can hear each other
- ✅ Chat works for all
- ✅ Reactions work for all
- ✅ No significant lag
- ✅ Video quality remains acceptable
- ✅ Audio quality remains clear
- ✅ No crashes or disconnections

**Pass Criteria**: All 8 checkmarks must be ✅

---

### Test 4.2: Long Duration Meeting (30+ Minutes)

**Test Steps**:
1. Start a meeting
2. Keep it running for 30 minutes
3. Periodically test features
4. Monitor memory usage
5. Check for disconnections

**Expected Result**:
- ✅ Connection remains stable
- ✅ No memory leaks (check browser task manager)
- ✅ Video quality doesn't degrade
- ✅ Audio quality doesn't degrade
- ✅ All features continue to work
- ✅ No automatic disconnections
- ✅ Timer shows correct duration

**Pass Criteria**: All 7 checkmarks must be ✅

---

## 5. EDGE CASES

### Test 5.1: Network Interruption

**Test Steps**:
1. Join meeting from 2 devices
2. Disconnect WiFi on one device for 10 seconds
3. Reconnect WiFi
4. Observe behavior

**Expected Result**:
- ✅ Disconnected user sees connection error
- ✅ Other user sees "participant left" notification
- ✅ Upon reconnection, can rejoin meeting
- ✅ Video/audio resumes normally

**Pass Criteria**: All 4 checkmarks must be ✅

---

### Test 5.2: Browser Refresh

**Test Steps**:
1. Join meeting
2. Refresh browser (F5)
3. Rejoin meeting

**Expected Result**:
- ✅ Can rejoin without issues
- ✅ Other participants see leave/join notifications
- ✅ Video/audio works after rejoin

**Pass Criteria**: All 3 checkmarks must be ✅

---

## 6. PERFORMANCE BENCHMARKS

### Metrics to Monitor:

**Connection Time**:
- Target: < 5 seconds from join to video visible
- Measure: Time from clicking "Join" to seeing remote video

**Video Quality**:
- Normal Mode: 720p @ 30fps
- Low Data Mode: 480p @ 15fps

**Audio Quality**:
- Latency: < 500ms
- No echo or feedback
- Clear voice transmission

**Data Usage** (per hour):
- Normal Mode: ~300-400 MB
- Low Data Mode: ~100-150 MB

**CPU Usage**:
- Desktop: < 30% (2 participants)
- Mobile: < 50% (2 participants)

**Memory Usage**:
- Desktop: < 500 MB
- Mobile: < 300 MB

---

## 7. BROWSER COMPATIBILITY

Test on these browsers:

- [ ] Chrome 90+ (Desktop)
- [ ] Chrome 90+ (Android)
- [ ] Firefox 88+ (Desktop)
- [ ] Edge 90+ (Desktop)
- [ ] Safari 14+ (Desktop)
- [ ] Safari 14+ (iOS)
- [ ] Samsung Internet 14+
- [ ] Opera 76+

---

## 8. FINAL CHECKLIST

Before deploying to production:

- [ ] All critical bugs fixed and verified
- [ ] All new features working
- [ ] Mobile testing complete
- [ ] Stress testing passed
- [ ] Edge cases handled
- [ ] Performance benchmarks met
- [ ] Browser compatibility verified
- [ ] Documentation updated
- [ ] Changelog created
- [ ] Code committed to GitHub

---

## 🐛 REPORTING ISSUES

If you find a bug:

1. Note the browser and version
2. Note the device (desktop/mobile)
3. Describe steps to reproduce
4. Include console errors (F12)
5. Include screenshots if possible
6. Note network conditions

---

## ✅ TEST RESULTS SUMMARY

**Date**: _______________  
**Tester**: _______________  
**Version**: 2.0.0

| Test Category | Pass | Fail | Notes |
|--------------|------|------|-------|
| Video Display Fix | ☐ | ☐ | |
| Audio Fix | ☐ | ☐ | |
| Reactions Fix | ☐ | ☐ | |
| Host Controls | ☐ | ☐ | |
| Notifications | ☐ | ☐ | |
| Participant List | ☐ | ☐ | |
| Chat System | ☐ | ☐ | |
| Recording | ☐ | ☐ | |
| Low Data Mode | ☐ | ☐ | |
| Mobile iOS | ☐ | ☐ | |
| Mobile Android | ☐ | ☐ | |
| Stress Test | ☐ | ☐ | |
| Edge Cases | ☐ | ☐ | |

**Overall Status**: ☐ PASS ☐ FAIL

**Notes**:
_______________________________________
_______________________________________
_______________________________________

