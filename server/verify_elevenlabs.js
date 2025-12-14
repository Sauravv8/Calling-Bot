const WebSocket = require('ws');

const WS_URL = 'ws://localhost:5000/outbound-media-stream';

console.log(`[Verify] Connecting to ${WS_URL}...`);
const ws = new WebSocket(WS_URL);

let hasReceivedAudio = false;

ws.on('open', () => {
    console.log('[Verify] Connected. Sending start event...');
    const startEvent = {
        event: 'start',
        start: {
            streamSid: 'TEST_STREAM_' + Date.now(),
            callSid: 'TEST_CALL_' + Date.now(),
            customParameters: {
                leadName: 'TestUser',
                leadCompany: 'TestCompany'
            }
        }
    };
    ws.send(JSON.stringify(startEvent));
});

ws.on('message', (data) => {
    try {
        const msg = JSON.parse(data);
        if (msg.event === 'media') {
            const payload = msg.media.payload;
            if (payload) {
                console.log(`[Verify] SUCCESS: Received audio chunk (${payload.length} chars).`);
                hasReceivedAudio = true;
                ws.close();
                process.exit(0);
            }
        } else {
            console.log(`[Verify] Received event: ${msg.event}`);
        }
    } catch (e) {
        console.error('[Verify] Error parsing message:', e);
    }
});

ws.on('close', (code, reason) => {
    console.log(`[Verify] Closed: ${code} ${reason}`);
    if (!hasReceivedAudio) {
        console.error('[Verify] FAILED directly: Connection closed before audio received.');
        process.exit(1);
    }
});

ws.on('error', (err) => {
    console.error('[Verify] Error:', err.message);
    process.exit(1);
});

// Timeout
setTimeout(() => {
    if (!hasReceivedAudio) {
        console.error('[Verify] FAILED: Timeout waiting for audio.');
        process.exit(1);
    }
}, 30000); // 30s timeout
