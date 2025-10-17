// COMPLETE APP.JS FILE - COPY THIS ENTIRE CONTENT TO static/app.js
// This file includes all functionality: WebRTC, Chat, Reactions, Recording, and UI Controls

// ===== GLOBAL VARIABLES =====
let localStream = null;
let peers = {};
let ws = null;
let meetingId = null;
let participantId = null;
let username = 'Anonymous';
let recorder = null;
let isRecording = false;
let isVideoEnabled = true;
let isAudioEnabled = true;
let isChatOpen = false;
let unreadMessages = 0;
let chatMessages = [];
let meetingStartTime = null;
let timerInterval = null;
let participantStates = {};

// ICE servers configuration
const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
    ]
};

// ===== DOM ELEMENTS =====
const joinSection = document.getElementById('joinSection');
const meetingSection = document.getElementById('meetingSection');
const meetingIdInput = document.getElementById('meetingIdInput');
const usernameInput = document.getElementById('usernameInput');
const createMeetingBtn = document.getElementById('createMeetingBtn');
const joinMeetingBtn = document.getElementById('joinMeetingBtn');
const videoGrid = document.getElementById('videoGrid');
const toggleVideoBtn = document.getElementById('toggleVideoBtn');
const toggleAudioBtn = document.getElementById('toggleAudioBtn');
const leaveMeetingBtn = document.getElementById('leaveMeetingBtn');
const toggleChatBtn = document.getElementById('toggleChatBtn');
const chatPanel = document.getElementById('chatPanel');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatMessages_el = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const unreadBadge = document.getElementById('unreadBadge');
const reactionsBtn = document.getElementById('reactionsBtn');
const reactionsPicker = document.getElementById('reactionsPicker');
const reactionsOverlay = document.getElementById('reactionsOverlay');
const recordBtn = document.getElementById('recordBtn');
const moreOptionsBtn = document.getElementById('moreOptionsBtn');
const moreOptionsMenu = document.getElementById('moreOptionsMenu');
const shareScreenBtn = document.getElementById('shareScreenBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const gridViewBtn = document.getElementById('gridViewBtn');
const speakerViewBtn = document.getElementById('speakerViewBtn');
const meetingTimer = document.getElementById('meetingTimer');
const meetingDate = document.getElementById('meetingDate');
const navMeetingId = document.getElementById('navMeetingId');
const navParticipantCount = document.getElementById('navParticipantCount');
const loadingSpinner = document.getElementById('loadingSpinner');

// ===== EVENT LISTENERS =====
createMeetingBtn.addEventListener('click', createMeeting);
joinMeetingBtn.addEventListener('click', joinMeeting);
toggleVideoBtn.addEventListener('click', toggleVideo);
toggleAudioBtn.addEventListener('click', toggleAudio);
leaveMeetingBtn.addEventListener('click', leaveMeeting);
toggleChatBtn.addEventListener('click', toggleChat);
closeChatBtn.addEventListener('click', toggleChat);
sendChatBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
});
reactionsBtn.addEventListener('click', toggleReactionsPicker);
recordBtn.addEventListener('click', toggleRecording);
moreOptionsBtn.addEventListener('click', toggleMoreOptions);
shareScreenBtn.addEventListener('click', shareScreen);
copyLinkBtn.addEventListener('click', copyMeetingLink);
gridViewBtn.addEventListener('click', () => setViewMode('grid'));
speakerViewBtn.addEventListener('click', () => setViewMode('speaker'));

// Reaction emoji buttons
document.querySelectorAll('.reaction-emoji').forEach(btn => {
    btn.addEventListener('click', () => {
        sendReaction(btn.dataset.emoji);
        toggleReactionsPicker();
    });
});

// Close menus when clicking outside
document.addEventListener('click', (e) => {
    if (!moreOptionsBtn.contains(e.target) && !moreOptionsMenu.contains(e.target)) {
        moreOptionsMenu.classList.add('hidden');
    }
    if (!reactionsBtn.contains(e.target) && !reactionsPicker.contains(e.target)) {
        reactionsPicker.classList.add('hidden');
    }
});

// Check URL for meeting ID
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlMeetingId = urlParams.get('meeting');
    if (urlMeetingId) {
        meetingIdInput.value = urlMeetingId;
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

// ===== MEETING FUNCTIONS =====
async function createMeeting() {
    try {
        const response = await fetch('/api/create_meeting');
        const data = await response.json();
        meetingIdInput.value = data.meeting_id;
        showStatus('Meeting created! ID: ' + data.meeting_id, 'success');
        await joinMeeting();
    } catch (error) {
        showStatus('Failed to create meeting: ' + error.message, 'error');
    }
}

async function joinMeeting() {
    const inputMeetingId = meetingIdInput.value.trim();
    const inputUsername = usernameInput.value.trim();
    
    if (!inputUsername) {
        showStatus('Please enter your name', 'error');
        usernameInput.focus();
        return;
    }
    
    if (!inputMeetingId) {
        await createMeeting();
        return;
    }
    
    meetingId = inputMeetingId;
    username = inputUsername;
    participantId = generateId();
    
    showLoading(true);
    
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: true
        });
        
        joinSection.classList.add('hidden');
        meetingSection.classList.remove('hidden');
        
        navMeetingId.textContent = meetingId;
        
        addVideoStream('local', localStream, username + ' (You)', true);
        
        meetingStartTime = Date.now();
        startMeetingTimer();
        
        connectWebSocket();
        
        showLoading(false);
        showStatus('Joined meeting successfully!', 'success');
    } catch (error) {
        showLoading(false);
        showStatus('Failed to access camera/microphone: ' + error.message, 'error');
        console.error('Media error:', error);
    }
}

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/${meetingId}/${participantId}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
    };
    
    ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);
        
        switch (message.type) {
            case 'existing_participants':
                message.participants.forEach(pid => {
                    createPeerConnection(pid, true);
                });
                break;
            
            case 'participant_joined':
                updateParticipantCount(message.participant_count);
                showStatus('A participant joined', 'info');
                break;
            
            case 'participant_left':
                if (peers[message.participant_id]) {
                    peers[message.participant_id].destroy();
                    delete peers[message.participant_id];
                    removeVideoStream(message.participant_id);
                }
                delete participantStates[message.participant_id];
                updateParticipantCount(message.participant_count);
                showStatus('A participant left', 'info');
                break;
            
            case 'chat':
                receiveChatMessage(message);
                break;
            
            case 'reaction':
                showReaction(message);
                break;
            
            case 'participant_state':
                updateParticipantState(message);
                break;
            
            case 'offer':
            case 'answer':
            case 'ice-candidate':
                await handleSignaling(message);
                break;
        }
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        showStatus('Connection error', 'error');
    };
    
    ws.onclose = () => {
        console.log('WebSocket closed');
    };
}

function createPeerConnection(peerId, initiator) {
    console.log(`Creating peer connection with ${peerId}, initiator: ${initiator}`);
    
    const peer = new SimplePeer({
        initiator: initiator,
        stream: localStream,
        config: iceServers,
        trickle: true
    });
    
    peer.on('signal', (data) => {
        console.log('Sending signal to', peerId);
        ws.send(JSON.stringify({
            type: data.type,
            target: peerId,
            ...data
        }));
    });
    
    peer.on('stream', (remoteStream) => {
        console.log('Received stream from', peerId);
        addVideoStream(peerId, remoteStream, 'Participant', false);
    });
    
    peer.on('error', (err) => {
        console.error('Peer error:', err);
    });
    
    peer.on('close', () => {
        console.log('Peer connection closed:', peerId);
        removeVideoStream(peerId);
    });
    
    peers[peerId] = peer;
}

async function handleSignaling(message) {
    const peerId = message.from;

    if (!peers[peerId]) {
        createPeerConnection(peerId, false);
    }

    peers[peerId].signal(message);
}

// ===== VIDEO FUNCTIONS =====
function addVideoStream(id, stream, label, isLocal) {
    removeVideoStream(id);

    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    videoContainer.id = `video-${id}`;

    if (isLocal) {
        videoContainer.classList.add('local-user');
    }

    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;

    if (isLocal) {
        video.muted = true;
    }

    const videoInfo = document.createElement('div');
    videoInfo.className = 'video-info';

    const videoName = document.createElement('div');
    videoName.className = 'video-name';
    videoName.textContent = label;

    const videoIndicators = document.createElement('div');
    videoIndicators.className = 'video-indicators';
    videoIndicators.id = `indicators-${id}`;

    videoInfo.appendChild(videoName);
    videoInfo.appendChild(videoIndicators);

    videoContainer.appendChild(video);
    videoContainer.appendChild(videoInfo);
    videoGrid.appendChild(videoContainer);

    if (!isLocal) {
        participantStates[id] = { video: true, audio: true };
    }
}

function removeVideoStream(id) {
    const videoContainer = document.getElementById(`video-${id}`);
    if (videoContainer) {
        videoContainer.remove();
    }
}

function toggleVideo() {
    isVideoEnabled = !isVideoEnabled;
    localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoEnabled;
    });

    if (isVideoEnabled) {
        toggleVideoBtn.classList.remove('active');
        toggleVideoBtn.querySelector('.control-label').textContent = 'Stop Video';
    } else {
        toggleVideoBtn.classList.add('active');
        toggleVideoBtn.querySelector('.control-label').textContent = 'Start Video';
    }

    broadcastParticipantState();
}

function toggleAudio() {
    isAudioEnabled = !isAudioEnabled;
    localStream.getAudioTracks().forEach(track => {
        track.enabled = isAudioEnabled;
    });

    if (isAudioEnabled) {
        toggleAudioBtn.classList.remove('active');
        toggleAudioBtn.querySelector('.control-label').textContent = 'Mute';
    } else {
        toggleAudioBtn.classList.add('active');
        toggleAudioBtn.querySelector('.control-label').textContent = 'Unmute';
    }

    broadcastParticipantState();
}

function broadcastParticipantState() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'participant_state',
            username: username,
            video_enabled: isVideoEnabled,
            audio_enabled: isAudioEnabled
        }));
    }
}

function updateParticipantState(message) {
    const peerId = message.from;
    participantStates[peerId] = {
        video: message.video_enabled,
        audio: message.audio_enabled
    };

    const indicators = document.getElementById(`indicators-${peerId}`);
    if (indicators) {
        indicators.innerHTML = '';

        if (!message.audio_enabled) {
            const mutedIcon = document.createElement('div');
            mutedIcon.className = 'indicator-icon muted';
            mutedIcon.textContent = '🎤🚫';
            indicators.appendChild(mutedIcon);
        }

        if (!message.video_enabled) {
            const videoOffIcon = document.createElement('div');
            videoOffIcon.className = 'indicator-icon video-off';
            videoOffIcon.textContent = '📹🚫';
            indicators.appendChild(videoOffIcon);
        }
    }
}

function setViewMode(mode) {
    if (mode === 'grid') {
        videoGrid.classList.remove('speaker-view');
        videoGrid.classList.add('grid-view');
        gridViewBtn.classList.add('active');
        speakerViewBtn.classList.remove('active');
    } else {
        videoGrid.classList.remove('grid-view');
        videoGrid.classList.add('speaker-view');
        gridViewBtn.classList.remove('active');
        speakerViewBtn.classList.add('active');
    }
}

function leaveMeeting() {
    Object.values(peers).forEach(peer => peer.destroy());
    peers = {};

    if (ws) {
        ws.close();
        ws = null;
    }

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    if (isRecording && recorder) {
        recorder.stopRecording();
        isRecording = false;
    }

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    videoGrid.innerHTML = '';
    chatMessages = [];
    chatMessages_el.innerHTML = '<div class="chat-empty">No messages yet. Start the conversation!</div>';
    unreadMessages = 0;
    updateUnreadBadge();

    meetingSection.classList.add('hidden');
    joinSection.classList.remove('hidden');

    showStatus('Left meeting', 'info');
}

// ===== CHAT FUNCTIONS =====
function toggleChat() {
    isChatOpen = !isChatOpen;
    chatPanel.classList.toggle('open', isChatOpen);

    if (isChatOpen) {
        unreadMessages = 0;
        updateUnreadBadge();
        chatInput.focus();
        scrollChatToBottom();
    }
}

function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message || !ws || ws.readyState !== WebSocket.OPEN) {
        return;
    }

    const timestamp = new Date().toISOString();

    ws.send(JSON.stringify({
        type: 'chat',
        username: username,
        message: message,
        timestamp: timestamp
    }));

    chatInput.value = '';
}

function receiveChatMessage(data) {
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message';

    const isOwnMessage = data.from === participantId;
    if (isOwnMessage) {
        messageEl.classList.add('own-message');
    }

    const senderEl = document.createElement('div');
    senderEl.className = 'message-sender';
    senderEl.textContent = isOwnMessage ? 'You' : data.username;

    const textEl = document.createElement('div');
    textEl.className = 'message-text';
    textEl.textContent = data.message;

    const timeEl = document.createElement('div');
    timeEl.className = 'message-time';
    timeEl.textContent = formatTime(data.timestamp);

    messageEl.appendChild(senderEl);
    messageEl.appendChild(textEl);
    messageEl.appendChild(timeEl);

    if (chatMessages_el.querySelector('.chat-empty')) {
        chatMessages_el.innerHTML = '';
    }

    chatMessages_el.appendChild(messageEl);
    chatMessages.push(data);

    if (!isChatOpen) {
        unreadMessages++;
        updateUnreadBadge();
    }

    scrollChatToBottom();
}

function scrollChatToBottom() {
    setTimeout(() => {
        chatMessages_el.scrollTop = chatMessages_el.scrollHeight;
    }, 100);
}

function updateUnreadBadge() {
    if (unreadMessages > 0) {
        unreadBadge.textContent = unreadMessages > 99 ? '99+' : unreadMessages;
        unreadBadge.classList.remove('hidden');
    } else {
        unreadBadge.classList.add('hidden');
    }
}

// ===== REACTION FUNCTIONS =====
function toggleReactionsPicker() {
    reactionsPicker.classList.toggle('hidden');
}

function sendReaction(emoji) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        return;
    }

    ws.send(JSON.stringify({
        type: 'reaction',
        username: username,
        emoji: emoji
    }));

    displayFloatingReaction(emoji, username);
}

function showReaction(data) {
    displayFloatingReaction(data.emoji, data.username);
}

function displayFloatingReaction(emoji, senderName) {
    const reactionEl = document.createElement('div');
    reactionEl.className = 'floating-reaction';
    reactionEl.textContent = emoji;

    const randomX = Math.random() * 80 + 10;
    reactionEl.style.left = `${randomX}%`;

    reactionsOverlay.appendChild(reactionEl);

    setTimeout(() => {
        reactionEl.remove();
    }, 4000);
}

// ===== RECORDING FUNCTIONS =====
function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    if (!localStream) {
        showStatus('No audio stream available', 'error');
        return;
    }

    try {
        recorder = new RecordRTC(localStream, {
            type: 'audio',
            mimeType: 'audio/wav',
            recorderType: RecordRTC.StereoAudioRecorder,
            numberOfAudioChannels: 1
        });

        recorder.startRecording();
        isRecording = true;
        recordBtn.classList.add('recording');
        recordBtn.querySelector('.control-label').textContent = 'Stop Recording';
        showStatus('Recording started', 'success');
    } catch (error) {
        showStatus('Failed to start recording: ' + error.message, 'error');
        console.error('Recording error:', error);
    }
}

function stopRecording() {
    if (!recorder || !isRecording) {
        return;
    }

    recorder.stopRecording(() => {
        const blob = recorder.getBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `meeting-${meetingId}-${Date.now()}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        isRecording = false;
        recordBtn.classList.remove('recording');
        recordBtn.querySelector('.control-label').textContent = 'Record';
        showStatus('Recording saved', 'success');
    });
}

// ===== UTILITY FUNCTIONS =====
function toggleMoreOptions() {
    moreOptionsMenu.classList.toggle('hidden');
}

function shareScreen() {
    showStatus('Screen sharing coming soon!', 'info');
    moreOptionsMenu.classList.add('hidden');
}

function copyMeetingLink() {
    const link = `${window.location.origin}?meeting=${meetingId}`;
    navigator.clipboard.writeText(link).then(() => {
        showStatus('Meeting link copied to clipboard!', 'success');
    }).catch(() => {
        showStatus('Failed to copy link', 'error');
    });
    moreOptionsMenu.classList.add('hidden');
}

function startMeetingTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        const elapsed = Date.now() - meetingStartTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        const timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        meetingTimer.textContent = timeString;
    }, 1000);
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (meetingDate) {
        meetingDate.textContent = `${dateString} • ${timeString}`;
    }
}

function updateParticipantCount(count) {
    if (navParticipantCount) {
        navParticipantCount.textContent = count;
    }
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function showLoading(show) {
    if (loadingSpinner) {
        loadingSpinner.classList.toggle('hidden', !show);
    }
}

function showStatus(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);

    const statusEl = document.createElement('div');
    statusEl.className = `status-message status-${type}`;
    statusEl.textContent = message;
    statusEl.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(statusEl);

    setTimeout(() => {
        statusEl.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => statusEl.remove(), 300);
    }, 3000);
}

// Add CSS animations for status messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('Online Church Meeting Platform - Ready!');

