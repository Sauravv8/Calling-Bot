const WebSocket = require('ws');

const WS_URL = 'ws://localhost:5000/outbound-media-stream';

console.log(`[Verify] Connecting to ${WS_URL}...`);
const ws = new WebSocket(WS_URL);

let audioReceived = false;

ws.on('open', () => {
    console.log('[Verify] Connected. Sending start event...');
    // Simulate what Twilio sends
    const startEvent = {
        event: 'start',
        start: {
            streamSid: 'TEST_STREAM_' + Date.now(),
            callSid: 'TEST_CALL_' + Date.now(),
            customParameters: {
                leadName: 'VerificationUser',
                leadCompany: 'VerificationCorp'
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
                if (!audioReceived) {
                    console.log(`[Verify] SUCCESS: First audio chunk received (${payload.length} chars). Agent started speaking.`);
                    audioReceived = true;
                    // We can exit here as success
                    console.log('[Verify] Test passed.');
                    ws.close();
                    process.exit(0);
                }
            }
        } else if (msg.event === 'mark') {
            console.log('[Verify] Mark event received.');
        } else if (msg.event === 'clear') {
            console.log('[Verify] Clear event received (Interruption).');
        } else {
            // console.log(`[Verify] Other event: ${msg.event}`);
        }
    } catch (e) {
        console.error('[Verify] Error parsing message:', e);
    }
});

ws.on('close', (code, reason) => {
    console.log(`[Verify] Closed: ${code} ${reason}`);
    if (!audioReceived) {
        console.error('[Verify] FAILED: Connection closed before audio received.');
        process.exit(1);
    }
});

ws.on('error', (err) => {
    console.error('[Verify] Error:', err.message);
    process.exit(1);
});

// Timeout
setTimeout(() => {
    if (!audioReceived) {
        console.error('[Verify] FAILED: Timeout waiting for audio.');
        process.exit(1);
    }
}, 30000); // 30s timeout
