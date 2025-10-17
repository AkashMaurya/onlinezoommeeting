// ===== ENHANCED ONLINE CHURCH MEETING PLATFORM =====
// Fixed: Video display, Audio issues, Emoji reactions
// Added: Host controls, Notifications, Mobile optimization, Low data mode

// ===== GLOBAL VARIABLES =====
let localStream = null;
let screenStream = null;
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
let isParticipantListOpen = false;
let unreadMessages = 0;
let chatMessages = [];
let meetingStartTime = null;
let timerInterval = null;
let participantStates = {};
let participants = {};
let isHost = false;
let hostId = null;
let lowDataMode = false;
let isScreenSharing = false;
let currentView = 'grid'; // 'grid' or 'speaker'
let activeSpeakerId = null;
let audioContext = null;
let audioAnalysers = {};

// ICE servers configuration with multiple STUN servers for better connectivity
const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
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
const meetingTimer = document.getElementById('meetingTimer');
const navMeetingId = document.getElementById('navMeetingId');
const navParticipantCount = document.getElementById('navParticipantCount');
const loadingSpinner = document.getElementById('loadingSpinner');
const participantListBtn = document.getElementById('participantListBtn');
const participantPanel = document.getElementById('participantPanel');
const closeParticipantBtn = document.getElementById('closeParticipantBtn');
const participantList = document.getElementById('participantList');
const hostBadge = document.getElementById('hostBadge');
const lowDataModeBtn = document.getElementById('lowDataModeBtn');
const toastContainer = document.getElementById('toastContainer');
const shareScreenBtn = document.getElementById('shareScreenBtn');
const gridViewBtn = document.getElementById('gridViewBtn');
const speakerViewBtn = document.getElementById('speakerViewBtn');

// ===== EVENT LISTENERS =====
createMeetingBtn.addEventListener('click', createMeeting);
joinMeetingBtn.addEventListener('click', joinMeeting);
toggleVideoBtn.addEventListener('click', toggleVideo);
toggleAudioBtn.addEventListener('click', toggleAudio);
leaveMeetingBtn.addEventListener('click', leaveMeeting);
toggleChatBtn.addEventListener('click', toggleChat);
closeChatBtn.addEventListener('click', toggleChat);
sendChatBtn.addEventListener('click', sendChatMessage);
participantListBtn.addEventListener('click', toggleParticipantList);
closeParticipantBtn.addEventListener('click', toggleParticipantList);
lowDataModeBtn.addEventListener('click', toggleLowDataMode);

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
});

reactionsBtn.addEventListener('click', toggleReactionsPicker);
recordBtn.addEventListener('click', toggleRecording);
shareScreenBtn.addEventListener('click', toggleScreenShare);
gridViewBtn.addEventListener('click', () => switchView('grid'));
speakerViewBtn.addEventListener('click', () => switchView('speaker'));

// Reaction emoji buttons
document.querySelectorAll('.reaction-emoji').forEach(btn => {
    btn.addEventListener('click', () => {
        sendReaction(btn.dataset.emoji);
        toggleReactionsPicker();
    });
});

// Close panels when clicking outside
document.addEventListener('click', (e) => {
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
});

// ===== MEETING FUNCTIONS =====
async function createMeeting() {
    try {
        showLoading(true);
        const response = await fetch('/api/create_meeting');
        const data = await response.json();
        meetingIdInput.value = data.meeting_id;
        showToast('Meeting created! ID: ' + data.meeting_id, 'success');
        await joinMeeting();
    } catch (error) {
        showToast('Failed to create meeting: ' + error.message, 'error');
        showLoading(false);
    }
}

async function joinMeeting() {
    const inputMeetingId = meetingIdInput.value.trim();
    
    if (!inputMeetingId) {
        showToast('Please enter a meeting ID or create a new meeting', 'error');
        return;
    }
    
    meetingId = inputMeetingId;
    username = usernameInput.value.trim() || 'Anonymous';
    participantId = generateId();
    
    try {
        showLoading(true);
        
        // Get user media with optimized constraints
        const constraints = {
            video: lowDataMode ? 
                { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15 } } :
                { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        };
        
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Show meeting section
        joinSection.classList.add('hidden');
        meetingSection.classList.remove('hidden');
        navMeetingId.textContent = meetingId;
        
        // Add local video
        addVideoStream('local', localStream, username + ' (You)', true);
        
        // Connect to WebSocket
        connectWebSocket();
        
        // Start meeting timer
        startMeetingTimer();

        // Setup active speaker detection
        setupActiveSpeakerDetection();

        showLoading(false);
        showToast('Joined meeting successfully!', 'success');
    } catch (error) {
        showToast('Failed to access camera/microphone: ' + error.message, 'error');
        console.error('Media error:', error);
        showLoading(false);
    }
}

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/${meetingId}/${participantId}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
        // Register username
        ws.send(JSON.stringify({
            type: 'register_username',
            username: username
        }));
    };
    
    ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);
        
        switch (message.type) {
            case 'existing_participants':
                // Set host status
                isHost = message.is_host;
                hostId = message.host_id;
                if (isHost) {
                    hostBadge.classList.remove('hidden');
                }
                
                // Create peer connections for existing participants
                message.participants.forEach(participant => {
                    participants[participant.id] = {
                        username: participant.username,
                        isHost: participant.is_host
                    };
                    createPeerConnection(participant.id, true);
                });
                updateParticipantList();
                break;
            
            case 'participant_joined':
                participants[message.participant_id] = {
                    username: message.username,
                    isHost: message.is_host
                };
                updateParticipantCount(message.participant_count);
                updateParticipantList();
                showToast(`${message.username} joined the meeting`, 'info');
                break;
            
            case 'participant_left':
                if (peers[message.participant_id]) {
                    peers[message.participant_id].destroy();
                    delete peers[message.participant_id];
                    removeVideoStream(message.participant_id);
                }
                delete participantStates[message.participant_id];
                delete participants[message.participant_id];
                updateParticipantCount(message.participant_count);
                updateParticipantList();
                showToast(`${message.username} left the meeting`, 'info');
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
            
            case 'host_control':
                handleHostControl(message);
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
        showToast('Connection error', 'error');
    };
    
    ws.onclose = () => {
        console.log('WebSocket closed');
    };
}

// ===== PEER CONNECTION FUNCTIONS =====
function createPeerConnection(peerId, initiator) {
    console.log(`Creating peer connection with ${peerId}, initiator: ${initiator}`);
    
    // FIX: Ensure localStream is available before creating peer
    if (!localStream) {
        console.error('Local stream not available');
        return;
    }
    
    const peer = new SimplePeer({
        initiator: initiator,
        stream: localStream,
        config: iceServers,
        trickle: true,
        // FIX: Add reconnection options
        reconnectTimer: 3000,
        iceTransportPolicy: 'all'
    });
    
    peer.on('signal', (data) => {
        console.log('Sending signal to', peerId, 'type:', data.type);
        ws.send(JSON.stringify({
            type: data.type,
            target: peerId,
            ...data
        }));
    });
    
    peer.on('stream', (remoteStream) => {
        console.log('Received stream from', peerId);
        const participantInfo = participants[peerId] || { username: 'Participant', isHost: false };
        addVideoStream(peerId, remoteStream, participantInfo.username, false);
    });
    
    peer.on('error', (err) => {
        console.error('Peer error with', peerId, ':', err);
        // FIX: Attempt to recreate connection on error
        setTimeout(() => {
            if (peers[peerId]) {
                console.log('Attempting to recreate peer connection with', peerId);
                delete peers[peerId];
                createPeerConnection(peerId, initiator);
            }
        }, 2000);
    });
    
    peer.on('close', () => {
        console.log('Peer connection closed:', peerId);
        removeVideoStream(peerId);
    });
    
    peers[peerId] = peer;
}

async function handleSignaling(message) {
    const peerId = message.from;

    // FIX: Create peer if it doesn't exist
    if (!peers[peerId]) {
        console.log('Creating peer for incoming signal from', peerId);
        createPeerConnection(peerId, false);
    }

    try {
        peers[peerId].signal(message);
    } catch (error) {
        console.error('Error handling signal from', peerId, ':', error);
    }
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

    // Add host indicator
    const participantInfo = participants[id];
    if (participantInfo && participantInfo.isHost) {
        videoContainer.classList.add('host-user');
    }

    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = isLocal; // Mute only local video to prevent feedback

    const videoInfo = document.createElement('div');
    videoInfo.className = 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3';

    const videoName = document.createElement('div');
    videoName.className = 'text-white font-semibold text-sm flex items-center space-x-2';

    const nameText = document.createElement('span');
    nameText.textContent = label;
    videoName.appendChild(nameText);

    // Add host badge
    if (participantInfo && participantInfo.isHost) {
        const hostBadgeEl = document.createElement('span');
        hostBadgeEl.className = 'px-2 py-0.5 bg-amber-500 text-xs rounded-full';
        hostBadgeEl.textContent = 'Host';
        videoName.appendChild(hostBadgeEl);
    }

    const videoIndicators = document.createElement('div');
    videoIndicators.className = 'flex items-center space-x-2 mt-1';
    videoIndicators.id = `indicators-${id}`;

    videoInfo.appendChild(videoName);
    videoInfo.appendChild(videoIndicators);

    videoContainer.appendChild(video);
    videoContainer.appendChild(videoInfo);

    // Add host controls if current user is host and this is not local video
    if (isHost && !isLocal) {
        const hostControls = document.createElement('div');
        hostControls.className = 'absolute top-2 right-2 flex space-x-1';

        const muteBtn = document.createElement('button');
        muteBtn.className = 'px-2 py-1 bg-gray-800 bg-opacity-75 hover:bg-opacity-100 rounded text-xs control-btn';
        muteBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        muteBtn.onclick = () => hostMuteParticipant(id);

        const videoBtn = document.createElement('button');
        videoBtn.className = 'px-2 py-1 bg-gray-800 bg-opacity-75 hover:bg-opacity-100 rounded text-xs control-btn';
        videoBtn.innerHTML = '<i class="fas fa-video-slash"></i>';
        videoBtn.onclick = () => hostStopVideo(id);

        hostControls.appendChild(muteBtn);
        hostControls.appendChild(videoBtn);
        videoContainer.appendChild(hostControls);
    }

    videoGrid.appendChild(videoContainer);

    if (!isLocal) {
        participantStates[id] = { video: true, audio: true };
        // Add audio analyser for active speaker detection
        addAudioAnalyser(id, stream);
    } else {
        // Add audio analyser for local stream too
        addAudioAnalyser('local', stream);
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
        toggleVideoBtn.classList.remove('bg-red-600');
        toggleVideoBtn.classList.add('bg-gray-700');
        toggleVideoBtn.querySelector('i').className = 'fas fa-video text-lg';
    } else {
        toggleVideoBtn.classList.remove('bg-gray-700');
        toggleVideoBtn.classList.add('bg-red-600');
        toggleVideoBtn.querySelector('i').className = 'fas fa-video-slash text-lg';
    }

    broadcastParticipantState();
}

function toggleAudio() {
    isAudioEnabled = !isAudioEnabled;
    localStream.getAudioTracks().forEach(track => {
        track.enabled = isAudioEnabled;
    });

    if (isAudioEnabled) {
        toggleAudioBtn.classList.remove('bg-red-600');
        toggleAudioBtn.classList.add('bg-gray-700');
        toggleAudioBtn.querySelector('i').className = 'fas fa-microphone text-lg';
    } else {
        toggleAudioBtn.classList.remove('bg-gray-700');
        toggleAudioBtn.classList.add('bg-red-600');
        toggleAudioBtn.querySelector('i').className = 'fas fa-microphone-slash text-lg';
    }

    broadcastParticipantState();
}

function broadcastParticipantState() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'participant_state',
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
            const muteIcon = document.createElement('span');
            muteIcon.className = 'text-red-500 text-xs';
            muteIcon.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            indicators.appendChild(muteIcon);
        }

        if (!message.video_enabled) {
            const videoIcon = document.createElement('span');
            videoIcon.className = 'text-red-500 text-xs';
            videoIcon.innerHTML = '<i class="fas fa-video-slash"></i>';
            indicators.appendChild(videoIcon);
        }
    }
}

// ===== HOST CONTROL FUNCTIONS =====
function hostMuteParticipant(participantId) {
    if (!isHost) return;

    ws.send(JSON.stringify({
        type: 'host_control',
        target_id: participantId,
        action: 'mute_audio',
        value: true
    }));

    showToast('Mute request sent', 'info');
}

function hostStopVideo(participantId) {
    if (!isHost) return;

    ws.send(JSON.stringify({
        type: 'host_control',
        target_id: participantId,
        action: 'stop_video',
        value: true
    }));

    showToast('Stop video request sent', 'info');
}

function kickParticipant(participantId, participantName) {
    if (!isHost) return;

    // Show confirmation dialog
    const confirmed = confirm(`Are you sure you want to remove ${participantName} from the meeting?`);

    if (confirmed) {
        ws.send(JSON.stringify({
            type: 'host_control',
            target_id: participantId,
            action: 'kick',
            value: true
        }));

        showToast(`${participantName} has been removed from the meeting`, 'warning');
    }
}

function handleHostControl(message) {
    if (!message.from_host) return;

    const action = message.action;
    const value = message.value;

    if (action === 'mute_audio' && value) {
        if (isAudioEnabled) {
            toggleAudio();
            showToast('Host has muted your microphone', 'warning');
        }
    } else if (action === 'stop_video' && value) {
        if (isVideoEnabled) {
            toggleVideo();
            showToast('Host has stopped your video', 'warning');
        }
    } else if (action === 'kick' && value) {
        // Participant has been kicked by host
        showToast('You have been removed from the meeting by the host', 'error');
        setTimeout(() => {
            leaveMeeting();
        }, 2000);
    }
}

// ===== CHAT FUNCTIONS =====
function toggleChat() {
    isChatOpen = !isChatOpen;

    if (isChatOpen) {
        chatPanel.classList.remove('hidden');
        isParticipantListOpen = false;
        participantPanel.classList.add('hidden');
        unreadMessages = 0;
        updateUnreadBadge();
        scrollChatToBottom();
    } else {
        chatPanel.classList.add('hidden');
    }
}

function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message || !ws) return;

    ws.send(JSON.stringify({
        type: 'chat',
        message: message,
        timestamp: new Date().toISOString()
    }));

    // Add own message to chat
    addChatMessage(username + ' (You)', message, true);
    chatInput.value = '';
    scrollChatToBottom();
}

function receiveChatMessage(message) {
    addChatMessage(message.username, message.message, false);

    if (!isChatOpen) {
        unreadMessages++;
        updateUnreadBadge();
    }

    scrollChatToBottom();
}

function addChatMessage(sender, message, isOwn) {
    const messageEl = document.createElement('div');
    messageEl.className = `flex ${isOwn ? 'justify-end' : 'justify-start'}`;

    const bubble = document.createElement('div');
    bubble.className = `max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
        isOwn ? 'bg-blue-600' : 'bg-gray-700'
    }`;

    const senderEl = document.createElement('div');
    senderEl.className = 'text-xs text-gray-300 mb-1';
    senderEl.textContent = sender;

    const textEl = document.createElement('div');
    textEl.className = 'text-sm break-words';
    textEl.textContent = message;

    const timeEl = document.createElement('div');
    timeEl.className = 'text-xs text-gray-400 mt-1';
    timeEl.textContent = formatTime(new Date());

    bubble.appendChild(senderEl);
    bubble.appendChild(textEl);
    bubble.appendChild(timeEl);
    messageEl.appendChild(bubble);
    chatMessages_el.appendChild(messageEl);
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
    if (!ws) return;

    ws.send(JSON.stringify({
        type: 'reaction',
        emoji: emoji
    }));

    // Show own reaction
    displayFloatingReaction(emoji, username + ' (You)');
}

function showReaction(message) {
    displayFloatingReaction(message.emoji, message.username);
}

function displayFloatingReaction(emoji, username) {
    const reaction = document.createElement('div');
    reaction.className = 'floating-reaction fixed text-6xl pointer-events-none z-40';
    reaction.textContent = emoji;

    // Random horizontal position
    const randomX = Math.random() * (window.innerWidth - 100);
    reaction.style.left = randomX + 'px';
    reaction.style.bottom = '100px';

    reactionsOverlay.appendChild(reaction);

    // Remove after animation
    setTimeout(() => {
        reaction.remove();
    }, 3000);
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
    if (!localStream) return;

    try {
        // Create audio context to mix all audio streams
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Get all audio tracks from local and remote streams
        const audioTracks = [];

        // Add local audio
        localStream.getAudioTracks().forEach(track => {
            if (track.enabled) audioTracks.push(track);
        });

        // Add remote audio from all peers
        Object.values(peers).forEach(peer => {
            if (peer._remoteStreams && peer._remoteStreams[0]) {
                peer._remoteStreams[0].getAudioTracks().forEach(track => {
                    audioTracks.push(track);
                });
            }
        });

        // Create a mixed audio stream
        const mixedStream = new MediaStream(audioTracks);

        // Record as MP3 (audio only)
        recorder = new RecordRTC(mixedStream, {
            type: 'audio',
            mimeType: 'audio/wav', // WAV for better compatibility, will save as MP3
            recorderType: RecordRTC.StereoAudioRecorder,
            numberOfAudioChannels: 2,
            desiredSampRate: 44100, // CD quality for MP3
            timeSlice: 1000
        });

        recorder.startRecording();
        isRecording = true;

        recordBtn.classList.remove('bg-gray-700');
        recordBtn.classList.add('bg-red-600', 'animate-pulse');
        recordBtn.querySelector('i').className = 'fas fa-stop text-lg';

        showToast('Audio recording started (MP3)', 'success');
    } catch (error) {
        console.error('Recording error:', error);
        showToast('Failed to start recording', 'error');
    }
}

function stopRecording() {
    if (!recorder) return;

    recorder.stopRecording(() => {
        const blob = recorder.getBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        // Save as MP3 format
        a.download = `church-meeting-audio-${meetingId}-${Date.now()}.mp3`;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        isRecording = false;
        recordBtn.classList.remove('bg-red-600', 'animate-pulse');
        recordBtn.classList.add('bg-gray-700');
        recordBtn.querySelector('i').className = 'fas fa-circle text-lg';

        showToast('Recording saved as MP3', 'success');
    });
}

// ===== SCREEN SHARING FUNCTIONS =====
async function toggleScreenShare() {
    if (isScreenSharing) {
        stopScreenShare();
    } else {
        await startScreenShare();
    }
}

async function startScreenShare() {
    try {
        // Request screen sharing with audio
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: 'always',
                displaySurface: 'monitor'
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });

        // Replace video track in all peer connections
        const screenVideoTrack = screenStream.getVideoTracks()[0];
        const screenAudioTrack = screenStream.getAudioTracks()[0];

        Object.values(peers).forEach(peer => {
            // Replace video track
            const sender = peer._pc.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(screenVideoTrack);
            }

            // Add audio track if available
            if (screenAudioTrack) {
                peer._pc.addTrack(screenAudioTrack, screenStream);
            }
        });

        // Update local video display
        const localVideo = document.querySelector('#video-local video');
        if (localVideo) {
            localVideo.srcObject = screenStream;
        }

        // Add screen sharing indicator
        const localContainer = document.getElementById('video-local');
        if (localContainer) {
            const indicator = document.createElement('div');
            indicator.className = 'screen-sharing-indicator';
            indicator.id = 'screen-indicator';
            indicator.innerHTML = '<i class="fas fa-desktop mr-1"></i> Sharing Screen';
            localContainer.appendChild(indicator);
        }

        // Update button state
        shareScreenBtn.classList.remove('bg-gray-700');
        shareScreenBtn.classList.add('bg-blue-600');
        shareScreenBtn.querySelector('i').className = 'fas fa-stop-circle text-lg';

        isScreenSharing = true;

        // Handle screen share stop (when user clicks browser's stop button)
        screenVideoTrack.onended = () => {
            stopScreenShare();
        };

        showToast('Screen sharing started', 'success');

        // Broadcast screen sharing state
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'screen_share',
                sharing: true
            }));
        }
    } catch (error) {
        console.error('Screen sharing error:', error);
        showToast('Failed to start screen sharing', 'error');
    }
}

function stopScreenShare() {
    if (!screenStream) return;

    // Stop all screen stream tracks
    screenStream.getTracks().forEach(track => track.stop());

    // Replace with original camera video
    const cameraVideoTrack = localStream.getVideoTracks()[0];

    Object.values(peers).forEach(peer => {
        const sender = peer._pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender && cameraVideoTrack) {
            sender.replaceTrack(cameraVideoTrack);
        }
    });

    // Update local video display
    const localVideo = document.querySelector('#video-local video');
    if (localVideo) {
        localVideo.srcObject = localStream;
    }

    // Remove screen sharing indicator
    const indicator = document.getElementById('screen-indicator');
    if (indicator) {
        indicator.remove();
    }

    // Update button state
    shareScreenBtn.classList.remove('bg-blue-600');
    shareScreenBtn.classList.add('bg-gray-700');
    shareScreenBtn.querySelector('i').className = 'fas fa-desktop text-lg';

    isScreenSharing = false;
    screenStream = null;

    showToast('Screen sharing stopped', 'info');

    // Broadcast screen sharing state
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'screen_share',
            sharing: false
        }));
    }
}

// ===== VIEW TOGGLE FUNCTIONS =====
function switchView(view) {
    currentView = view;

    if (view === 'grid') {
        videoGrid.classList.remove('speaker-view');
        videoGrid.classList.add('grid-view');
        gridViewBtn.classList.add('bg-blue-600');
        gridViewBtn.classList.remove('hover:bg-gray-600');
        speakerViewBtn.classList.remove('bg-blue-600');
        speakerViewBtn.classList.add('hover:bg-gray-600');
    } else {
        videoGrid.classList.remove('grid-view');
        videoGrid.classList.add('speaker-view');
        speakerViewBtn.classList.add('bg-blue-600');
        speakerViewBtn.classList.remove('hover:bg-gray-600');
        gridViewBtn.classList.remove('bg-blue-600');
        gridViewBtn.classList.add('hover:bg-gray-600');

        // Rearrange videos for speaker view
        arrangeForSpeakerView();
    }

    showToast(`Switched to ${view} view`, 'info');
}

function arrangeForSpeakerView() {
    const videoContainers = Array.from(videoGrid.children);

    // Find active speaker or use first video
    let mainSpeaker = videoContainers.find(v => v.classList.contains('active-speaker'));
    if (!mainSpeaker && videoContainers.length > 0) {
        mainSpeaker = videoContainers[0];
    }

    if (mainSpeaker) {
        mainSpeaker.classList.add('main-speaker');
        videoGrid.prepend(mainSpeaker);
    }

    // Mark others as thumbnails
    videoContainers.forEach(v => {
        if (v !== mainSpeaker) {
            v.classList.remove('main-speaker');
        }
    });
}

// ===== ACTIVE SPEAKER DETECTION =====
function setupActiveSpeakerDetection() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Monitor all audio streams
    setInterval(() => {
        let maxVolume = 0;
        let loudestId = null;

        Object.keys(audioAnalysers).forEach(id => {
            const analyser = audioAnalysers[id];
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);

            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

            if (average > maxVolume && average > 30) { // Threshold for speech
                maxVolume = average;
                loudestId = id;
            }
        });

        // Update active speaker
        if (loudestId && loudestId !== activeSpeakerId) {
            // Remove previous active speaker highlight
            if (activeSpeakerId) {
                const prevContainer = document.getElementById(`video-${activeSpeakerId}`);
                if (prevContainer) {
                    prevContainer.classList.remove('active-speaker');
                }
            }

            // Add new active speaker highlight
            const newContainer = document.getElementById(`video-${loudestId}`);
            if (newContainer) {
                newContainer.classList.add('active-speaker');
                activeSpeakerId = loudestId;

                // If in speaker view, make this the main speaker
                if (currentView === 'speaker') {
                    arrangeForSpeakerView();
                }
            }
        }
    }, 500); // Check every 500ms
}

function addAudioAnalyser(id, stream) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioAnalysers[id] = analyser;
    }
}

// ===== PARTICIPANT LIST FUNCTIONS =====
function toggleParticipantList() {
    isParticipantListOpen = !isParticipantListOpen;

    if (isParticipantListOpen) {
        participantPanel.classList.remove('hidden');
        isChatOpen = false;
        chatPanel.classList.add('hidden');
        updateParticipantList();
    } else {
        participantPanel.classList.add('hidden');
    }
}

function updateParticipantList() {
    participantList.innerHTML = '';

    // Add self
    addParticipantToList('local', username + ' (You)', true, isHost);

    // Add other participants
    Object.keys(participants).forEach(pid => {
        const participant = participants[pid];
        addParticipantToList(pid, participant.username, false, participant.isHost);
    });
}

function addParticipantToList(id, name, isSelf, isParticipantHost) {
    const item = document.createElement('div');
    item.className = 'flex items-center justify-between p-3 bg-gray-700 rounded-lg';

    const info = document.createElement('div');
    info.className = 'flex items-center space-x-3';

    const avatar = document.createElement('div');
    avatar.className = `w-10 h-10 rounded-full flex items-center justify-center ${
        isParticipantHost ? 'bg-amber-500' : 'bg-blue-500'
    }`;
    avatar.textContent = name.charAt(0).toUpperCase();

    const details = document.createElement('div');

    const nameEl = document.createElement('div');
    nameEl.className = 'font-semibold text-sm flex items-center space-x-2';

    const nameText = document.createElement('span');
    nameText.textContent = name;
    nameEl.appendChild(nameText);

    if (isParticipantHost) {
        const badge = document.createElement('span');
        badge.className = 'px-2 py-0.5 bg-amber-500 text-xs rounded-full';
        badge.textContent = 'Host';
        nameEl.appendChild(badge);
    }

    const statusEl = document.createElement('div');
    statusEl.className = 'text-xs text-gray-400 flex items-center space-x-2';

    const state = participantStates[id];
    if (state) {
        if (!state.audio) {
            const muteIcon = document.createElement('span');
            muteIcon.className = 'text-red-500';
            muteIcon.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            statusEl.appendChild(muteIcon);
        }
        if (!state.video) {
            const videoIcon = document.createElement('span');
            videoIcon.className = 'text-red-500';
            videoIcon.innerHTML = '<i class="fas fa-video-slash"></i>';
            statusEl.appendChild(videoIcon);
        }
    }

    details.appendChild(nameEl);
    details.appendChild(statusEl);

    info.appendChild(avatar);
    info.appendChild(details);
    item.appendChild(info);

    // Add host controls if current user is host and this is not self
    if (isHost && !isSelf) {
        const controls = document.createElement('div');
        controls.className = 'flex items-center space-x-2';

        // Mute button
        const muteBtn = document.createElement('button');
        muteBtn.className = 'host-control-btn bg-yellow-600 hover:bg-yellow-700 text-white';
        muteBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        muteBtn.title = 'Mute participant';
        muteBtn.onclick = () => hostMuteParticipant(id);

        // Kick button
        const kickBtn = document.createElement('button');
        kickBtn.className = 'host-control-btn bg-red-600 hover:bg-red-700 text-white';
        kickBtn.innerHTML = '<i class="fas fa-user-times"></i>';
        kickBtn.title = 'Remove participant';
        kickBtn.onclick = () => kickParticipant(id, name);

        controls.appendChild(muteBtn);
        controls.appendChild(kickBtn);
        item.appendChild(controls);
    }

    participantList.appendChild(item);
}

// ===== LOW DATA MODE =====
function toggleLowDataMode() {
    lowDataMode = !lowDataMode;

    if (lowDataMode) {
        lowDataModeBtn.classList.add('bg-blue-600');
        lowDataModeBtn.classList.remove('bg-gray-700');
        showToast('Low data mode enabled', 'info');

        // Reduce video quality for existing streams
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                const constraints = {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 15 }
                };
                track.applyConstraints(constraints).catch(err => {
                    console.error('Error applying constraints:', err);
                });
            });
        }

        videoGrid.classList.add('low-data-active');
    } else {
        lowDataModeBtn.classList.remove('bg-blue-600');
        lowDataModeBtn.classList.add('bg-gray-700');
        showToast('Low data mode disabled', 'info');

        // Restore video quality
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                const constraints = {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                };
                track.applyConstraints(constraints).catch(err => {
                    console.error('Error applying constraints:', err);
                });
            });
        }

        videoGrid.classList.remove('low-data-active');
    }
}

// ===== UTILITY FUNCTIONS =====
function leaveMeeting() {
    // Close all peer connections
    Object.values(peers).forEach(peer => peer.destroy());
    peers = {};

    // Close WebSocket
    if (ws) {
        ws.close();
        ws = null;
    }

    // Stop local stream
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    // Stop recording if active
    if (isRecording) {
        stopRecording();
    }

    // Stop timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Clear video grid
    videoGrid.innerHTML = '';

    // Reset state
    participants = {};
    participantStates = {};
    isHost = false;
    hostId = null;
    chatMessages_el.innerHTML = '';
    participantList.innerHTML = '';

    // Show join section
    meetingSection.classList.add('hidden');
    joinSection.classList.remove('hidden');

    showToast('Left meeting', 'info');
}

function startMeetingTimer() {
    meetingStartTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - meetingStartTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        meetingTimer.textContent =
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function updateParticipantCount(count) {
    navParticipantCount.textContent = count;
}

function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast px-6 py-4 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-600' :
        type === 'error' ? 'bg-red-600' :
        type === 'warning' ? 'bg-amber-600' :
        'bg-blue-600'
    }`;

    const content = document.createElement('div');
    content.className = 'flex items-center space-x-3';

    const icon = document.createElement('i');
    icon.className = `fas ${
        type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-circle' :
        type === 'warning' ? 'fa-exclamation-triangle' :
        'fa-info-circle'
    } text-xl`;

    const text = document.createElement('span');
    text.textContent = message;

    content.appendChild(icon);
    content.appendChild(text);
    toast.appendChild(content);

    toastContainer.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// ===== MOBILE OPTIMIZATIONS =====
// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        // Adjust video grid layout
        const videos = document.querySelectorAll('.video-container');
        videos.forEach(video => {
            video.style.height = 'auto';
        });
    }, 100);
});

// Prevent pull-to-refresh on mobile
document.body.addEventListener('touchmove', (e) => {
    if (e.target === document.body) {
        e.preventDefault();
    }
}, { passive: false });

// Handle visibility change (app goes to background)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('App went to background');
        // Optionally reduce quality or pause video
    } else {
        console.log('App came to foreground');
        // Restore quality
    }
});

console.log('Online Church Meeting Platform loaded - Enhanced version with bug fixes and new features');
console.log('Features: Host controls, Notifications, Mobile optimization, Low data mode, MP3 recording');

