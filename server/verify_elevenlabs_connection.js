require('dotenv').config();
const WebSocket = require('ws');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

console.log('--- Verifying ElevenLabs Connection ---');
console.log('Agent ID:', ELEVENLABS_AGENT_ID);
console.log('API Key Present:', !!ELEVENLABS_API_KEY);

if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID) {
    console.error('Missing credentials!');
    process.exit(1);
}

const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${ELEVENLABS_AGENT_ID}`;
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
    console.log('Identify successful: WebSocket Connection Opened!');

    const initialConfig = {
        type: "conversation_initiation_client_data",
        conversation_config_override: {
            agent: {
                prompt: {
                    prompt: "This is a test system prompt to verify override capabilities."
                },
                first_message: "Hello, verification successful.",
            }
        },
        dynamic_variables: {
            leadName: "TestUser",
            leadCompany: "TestCompany"
        }
    };

    console.log('Sending init config...');
    ws.send(JSON.stringify(initialConfig));
});

ws.on('message', (data) => {
    try {
        const msg = JSON.parse(data);
        console.log('Received message type:', msg.type);
        if (msg.type === 'audio') {
            console.log('Received Audio (Connection Working!)');
            // If we get audio or a text response, it implies the init payload was accepted (or at least didn't crash immediately)
            ws.close();
            process.exit(0);
        }
    } catch (err) {
        console.log('Received raw:', data.toString());
    }
});

ws.on('error', (err) => {
    console.error('WebSocket Error:', err.message);
    process.exit(1);
});

ws.on('close', (code, reason) => {
    console.log(`Disconnected: ${code} ${reason}`);
});
