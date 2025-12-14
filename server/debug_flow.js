require('dotenv').config();
const WebSocket = require('ws');
const fs = require('fs');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

console.log('--- Simulating Twilio Call Flow ---');

// 1. Setup ElevenLabs Connection
// 1. Setup ElevenLabs Connection
// PCC: Testing Default Format (MP3) to rule out u-law generation failure
const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${ELEVENLABS_AGENT_ID}`;
const elWs = new WebSocket(wsUrl, {
    headers: { 'xi-api-key': ELEVENLABS_API_KEY }
});

const outputStream = fs.createWriteStream('test_output.ulaw');
let receivedAudioBytes = 0;

elWs.on('open', () => {
    console.log('[ElevenLabs] Connected!');

    // 2. Send Init Config (Simulate Start of Call)
    const initialConfig = {
        type: "conversation_initiation_client_data",
        conversation_config_override: {
            agent: {
                first_message: "Hello? detailed debug test starting.",
            }
        }
    };
    elWs.send(JSON.stringify(initialConfig));
    console.log('[ElevenLabs] Sent Init Config. Waiting for audio...');

    // 3. Simulate incoming Silence (u-law) after 1 second
    // (Simulates Twilio starting to verify connection)
    // 3. Simulate incoming Silence (u-law) after 1 second
    // (Simulates Twilio starting to verify connection)
    // setTimeout(() => {
    //     // Mock 1 second of u-law silence (0xFF is silence in u-law)
    //     const silenceBuffer = Buffer.alloc(8000, 0xFF); 
    //     const payload = {
    //         user_audio_chunk: silenceBuffer.toString('base64')
    //     };
    //     // console.log('Sending mock audio chunk...');
    //     if(elWs.readyState === WebSocket.OPEN) {
    //          elWs.send(JSON.stringify(payload));
    //     }
    // }, 1000);
});

elWs.on('message', (data) => {
    try {
        const msg = JSON.parse(data);
        if (msg.type === 'audio') {
            const chunk = Buffer.from(msg.audio_event.audio_base_64, 'base64');
            receivedAudioBytes += chunk.length;
            outputStream.write(chunk);
            console.log(`[RX] Audio Event: ${chunk.length} bytes (Total: ${receivedAudioBytes})`);

            // If we get enough audio, we consider it a success
            if (receivedAudioBytes > 5000) {
                console.log('--- TEST PASSED: Received significant audio ---');
                elWs.close();
                process.exit(0);
            }
        } else {
            console.log(`[RX] Msg Type: ${msg.type}`);
        }
    } catch (err) {
        console.error('Parse Error:', err);
    }
});

elWs.on('error', (e) => console.error('[Error]', e.message));
elWs.on('close', (c, r) => console.log('[Close]', c, r));
