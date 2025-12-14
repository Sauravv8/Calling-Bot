require('dotenv').config();
const WebSocket = require('ws');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

console.log('--- Verifying ElevenLabs Audio (ulaw_8000 + Config) ---');

if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID) {
    console.error('Missing credentials!');
    process.exit(1);
}

// PCC: Testing default format (mp3/pcm) to rule out transcoding issues
// PCC: Testing Authentication Header
const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${ELEVENLABS_AGENT_ID}`;
const ws = new WebSocket(wsUrl, {
    headers: {
        'xi-api-key': ELEVENLABS_API_KEY
    }
});

ws.on('open', () => {
    console.log('WebSocket Connection Opened!');

    // Minimal config - just wake it up
    // const initialConfig = {
    //     type: "conversation_initiation_client_data",
    //     conversation_config_override: {
    //         agent: {
    //             first_message: "Hello? Can you hear me?",
    //         }
    //     }
    // };

    console.log('Connected. Waiting for pings...');
    // ws.send(JSON.stringify(initialConfig));
});

ws.on('message', (data) => {
    try {
        const msg = JSON.parse(data);
        // console.log('Received message type:', msg.type);

        if (msg.type === 'audio') {
            const audio = msg.audio_event?.audio_base_64;
            if (audio) {
                console.log(`[SUCCESS] Received Audio Chunk! Size: ${audio.length} bytes`);
                ws.close();
                process.exit(0);
            }
        } else {
            console.log(`Received non-audio message: ${msg.type}`);
        }
    } catch (err) {
        console.log('Error parsing:', err.message);
    }
});

ws.on('error', (err) => {
    console.error('WebSocket Error:', err.message);
    process.exit(1);
});

ws.on('close', (code, reason) => {
    console.log(`Disconnected: ${code} ${reason}`);
});
