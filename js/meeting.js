/* ============================================
   EduNova — Meeting Room JavaScript
   ============================================ */

let isMicOn = true;
let isCamOn = false;
let isScreenSharing = false;
let isWhiteboardOpen = false;
let isRecording = false;
let isHandRaised = false;
let meetingSeconds = 0;
let timerInterval = null;
let currentPanel = '';

// Whiteboard state
let isDrawing = false;
let whiteboardCtx = null;

document.addEventListener('DOMContentLoaded', () => {
    initWhiteboard();
});

/* ---- Pre-Join Actions ---- */
function togglePreviewMic() {
    isMicOn = !isMicOn;
    const btn = document.getElementById('previewMicBtn');
    if (isMicOn) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    }
}

function togglePreviewCam() {
    isCamOn = !isCamOn;
    const btn = document.getElementById('previewCamBtn');
    const video = document.getElementById('localPreview');
    const placeholder = document.getElementById('previewPlaceholder');

    if (isCamOn) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-video"></i>';

        // Try to access camera
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    video.srcObject = stream;
                    video.classList.add('active');
                    video.style.display = 'block';
                    placeholder.style.display = 'none';
                })
                .catch(() => {
                    showNotification('Camera access denied. Please check permissions.', 'warning');
                    isCamOn = false;
                    btn.classList.remove('active');
                    btn.innerHTML = '<i class="fas fa-video-slash"></i>';
                });
        }
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-video-slash"></i>';

        // Stop camera
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        video.style.display = 'none';
        placeholder.style.display = 'flex';
    }
}

/* ---- Join / Create Meeting ---- */
function joinMeeting() {
    const name = document.getElementById('displayName').value.trim();
    if (!name) {
        showNotification('Please enter your name.', 'warning');
        return;
    }

    const code = document.getElementById('meetingCode').value.trim();

    // Hide pre-join, show meeting room
    document.getElementById('preJoinScreen').style.display = 'none';
    document.getElementById('meetingRoom').style.display = 'flex';

    // Set meeting info
    if (code) {
        document.getElementById('meetingIdDisplay').textContent = code;
    }

    // Start timer
    startMeetingTimer();

    // Update mic/cam state
    updateMeetingControls();

    showNotification('You joined the meeting! 🎥', 'success');
}

function createMeeting() {
    const name = document.getElementById('displayName').value.trim();
    if (!name) {
        showNotification('Please enter your name.', 'warning');
        return;
    }

    // Generate meeting code
    const code = 'EDN-' + new Date().getFullYear() + '-' + generateCode(4);
    document.getElementById('meetingCode').value = code;

    // Hide pre-join, show meeting room
    document.getElementById('preJoinScreen').style.display = 'none';
    document.getElementById('meetingRoom').style.display = 'flex';

    document.getElementById('meetingIdDisplay').textContent = code;

    // Start timer
    startMeetingTimer();

    updateMeetingControls();

    showNotification(`Meeting created! Code: ${code}`, 'success');
}

function generateCode(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
    }
    return result;
}

/* ---- Meeting Timer ---- */
const MAX_LIVE_SECONDS = 3 * 60 * 60; // 3 hours max for live classes

function startMeetingTimer() {
    meetingSeconds = 0;
    timerInterval = setInterval(() => {
        meetingSeconds++;

        // Enforce 3-hour maximum
        if (meetingSeconds >= MAX_LIVE_SECONDS) {
            clearInterval(timerInterval);
            showNotification('Maximum class duration of 3 hours reached. The meeting will end now.', 'warning');
            setTimeout(() => endMeeting(), 3000);
            return;
        }

        // Warn at 2h 50m (170 minutes)
        if (meetingSeconds === 170 * 60) {
            showNotification('10 minutes remaining — live classes are limited to 3 hours.', 'warning');
        }

        const timeStr = formatTime(meetingSeconds);
        const timerEl = document.getElementById('meetingTimer');
        const timerSmEl = document.getElementById('meetingTimeSmall');
        if (timerEl) timerEl.textContent = timeStr;
        if (timerSmEl) timerSmEl.textContent = timeStr;
    }, 1000);
}

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':');
}

/* ---- Meeting Controls ---- */
function updateMeetingControls() {
    const micBtn = document.getElementById('micBtn');
    const camBtn = document.getElementById('camBtn');

    if (micBtn) {
        if (isMicOn) {
            micBtn.classList.add('active');
            micBtn.querySelector('i').className = 'fas fa-microphone';
        } else {
            micBtn.classList.remove('active');
            micBtn.querySelector('i').className = 'fas fa-microphone-slash';
        }
    }

    if (camBtn) {
        if (isCamOn) {
            camBtn.classList.add('active');
            camBtn.querySelector('i').className = 'fas fa-video';
        } else {
            camBtn.classList.remove('active');
            camBtn.querySelector('i').className = 'fas fa-video-slash';
        }
    }
}

function toggleMic() {
    isMicOn = !isMicOn;
    updateMeetingControls();
    showNotification(isMicOn ? 'Microphone on' : 'Microphone muted', 'info');
}

function toggleCam() {
    isCamOn = !isCamOn;
    const mainVideo = document.getElementById('mainVideo');

    if (isCamOn && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                const video = mainVideo.querySelector('video');
                video.srcObject = stream;
                video.style.display = 'block';
                mainVideo.querySelector('.video-tile-placeholder').style.display = 'none';
            })
            .catch(() => {
                isCamOn = false;
                showNotification('Camera access denied.', 'warning');
            });
    } else if (!isCamOn) {
        const video = mainVideo.querySelector('video');
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        video.style.display = 'none';
        mainVideo.querySelector('.video-tile-placeholder').style.display = 'flex';
    }

    updateMeetingControls();
}

function toggleScreenShare() {
    const screenBtn = document.getElementById('screenBtn');
    const videoGrid = document.getElementById('videoGrid');
    const screenShareView = document.getElementById('screenShareView');

    isScreenSharing = !isScreenSharing;

    if (isScreenSharing) {
        // Close whiteboard if open
        if (isWhiteboardOpen) toggleWhiteboard();

        videoGrid.style.display = 'none';
        screenShareView.style.display = 'flex';
        screenBtn.classList.add('active');
        showNotification('Screen sharing started', 'info');
    } else {
        videoGrid.style.display = 'grid';
        screenShareView.style.display = 'none';
        screenBtn.classList.remove('active');
        showNotification('Screen sharing stopped', 'info');
    }
}

function toggleWhiteboard() {
    const whiteboardBtn = document.getElementById('whiteboardBtn');
    const videoGrid = document.getElementById('videoGrid');
    const whiteboardView = document.getElementById('whiteboardView');

    isWhiteboardOpen = !isWhiteboardOpen;

    if (isWhiteboardOpen) {
        // Close screen share if open
        if (isScreenSharing) toggleScreenShare();

        videoGrid.style.display = 'none';
        whiteboardView.style.display = 'flex';
        whiteboardBtn.classList.add('active');
        showNotification('Whiteboard opened', 'info');
    } else {
        videoGrid.style.display = 'grid';
        whiteboardView.style.display = 'none';
        whiteboardBtn.classList.remove('active');
    }
}

function toggleRecording() {
    isRecording = !isRecording;
    const recordBtn = document.getElementById('recordBtn');
    const recIndicator = document.querySelector('.rec-indicator');

    if (isRecording) {
        recordBtn.classList.add('active');
        recordBtn.style.background = '#e74c3c';
        recordBtn.style.borderColor = '#e74c3c';
        if (recIndicator) recIndicator.style.display = 'flex';
        showNotification('Recording started 🔴', 'info');
    } else {
        recordBtn.classList.remove('active');
        recordBtn.style.background = '';
        recordBtn.style.borderColor = '';
        if (recIndicator) recIndicator.style.display = 'none';
        showNotification('Recording saved', 'success');
    }
}

function toggleHand() {
    isHandRaised = !isHandRaised;
    const handBtn = document.getElementById('handBtn');

    if (isHandRaised) {
        handBtn.classList.add('active');
        sendReaction('✋');
        showNotification('Hand raised', 'info');
    } else {
        handBtn.classList.remove('active');
        showNotification('Hand lowered', 'info');
    }
}

/* ---- Side Panel ---- */
function togglePanel(panel) {
    const sidePanel = document.getElementById('sidePanel');
    const panels = ['chat', 'participants', 'content'];

    if (currentPanel === panel || panel === '') {
        // Close panel
        sidePanel.classList.remove('open');
        panels.forEach(p => {
            const el = document.getElementById(`${p}Panel`);
            if (el) el.classList.remove('active');
        });
        currentPanel = '';
    } else {
        // Open requested panel
        sidePanel.classList.add('open');
        panels.forEach(p => {
            const el = document.getElementById(`${p}Panel`);
            if (el) el.classList.remove('active');
        });
        const targetPanel = document.getElementById(`${panel}Panel`);
        if (targetPanel) targetPanel.classList.add('active');
        currentPanel = panel;
    }
}

/* ---- Chat ---- */
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    const chatMessages = document.getElementById('chatMessages');
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const messageHtml = `
        <div class="chat-message chat-message-self">
            <div class="chat-bubble">
                <div class="chat-sender">You <span class="chat-time">${time}</span></div>
                <p>${escapeHtml(message)}</p>
            </div>
        </div>
    `;

    chatMessages.insertAdjacentHTML('beforeend', messageHtml);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    input.value = '';
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ---- Reactions ---- */
function sendReaction(emoji) {
    const container = document.getElementById('reactionsContainer');
    const reaction = document.createElement('div');
    reaction.className = 'reaction-emoji';
    reaction.textContent = emoji;
    reaction.style.left = `${Math.random() * 200 - 100}px`;
    container.appendChild(reaction);

    setTimeout(() => reaction.remove(), 2000);
}

/* ---- Mute All ---- */
function muteAll() {
    showNotification('All participants have been muted', 'info');
    document.querySelectorAll('.participant-actions .fa-microphone').forEach(icon => {
        icon.className = 'fas fa-microphone-slash muted';
    });
}

/* ---- Copy Meeting Link ---- */
function copyMeetingLink() {
    const meetingId = document.getElementById('meetingIdDisplay').textContent;
    const link = `${window.location.origin}/meeting.html?code=${meetingId}`;

    navigator.clipboard.writeText(link).then(() => {
        showNotification('Meeting link copied to clipboard! 📋', 'success');
    }).catch(() => {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Meeting link copied! 📋', 'success');
    });
}

/* ---- End Meeting ---- */
function endMeeting() {
    if (timerInterval) clearInterval(timerInterval);

    // Stop any media streams
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
    });

    showNotification('Meeting ended. Thank you! 👋', 'info');

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

/* ---- Whiteboard ---- */
function initWhiteboard() {
    const canvas = document.getElementById('whiteboardCanvas');
    if (!canvas) return;

    whiteboardCtx = canvas.getContext('2d');

    // Resize canvas
    function resizeCanvas() {
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight - 60;
        }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Drawing
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;

        const colorInput = document.querySelector('.wb-color');
        const sizeSelect = document.querySelector('.wb-size');

        whiteboardCtx.beginPath();
        whiteboardCtx.moveTo(lastX, lastY);
        whiteboardCtx.lineTo(e.offsetX, e.offsetY);
        whiteboardCtx.strokeStyle = colorInput ? colorInput.value : '#667eea';
        whiteboardCtx.lineWidth = sizeSelect ? parseInt(sizeSelect.value) : 4;
        whiteboardCtx.lineCap = 'round';
        whiteboardCtx.lineJoin = 'round';
        whiteboardCtx.stroke();

        [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);

    // Tool selection
    document.querySelectorAll('.wb-tool[data-tool]').forEach(tool => {
        tool.addEventListener('click', () => {
            document.querySelectorAll('.wb-tool[data-tool]').forEach(t => t.classList.remove('active'));
            tool.classList.add('active');

            const toolType = tool.getAttribute('data-tool');
            if (toolType === 'eraser') {
                canvas.style.cursor = 'cell';
            } else {
                canvas.style.cursor = 'crosshair';
            }
        });
    });
}

function clearWhiteboard() {
    const canvas = document.getElementById('whiteboardCanvas');
    if (canvas && whiteboardCtx) {
        whiteboardCtx.clearRect(0, 0, canvas.width, canvas.height);
        showNotification('Whiteboard cleared', 'info');
    }
}

function saveWhiteboard() {
    const canvas = document.getElementById('whiteboardCanvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `edunova-whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    showNotification('Whiteboard saved as image! 📥', 'success');
}
