require('dotenv').config();
const https = require('https');

const API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = 'agent_0701kd895j37ehf97fm36ehjhv6s'; // Newer 'Ether' agent

if (!API_KEY || !AGENT_ID) {
    console.error('Error: ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID is missing in .env');
    process.exit(1);
}

console.log(`Checking configuration for Agent ID: ${AGENT_ID}`);

const options = {
    hostname: 'api.elevenlabs.io',
    path: `/v1/convai/agents/${AGENT_ID}`,
    method: 'GET',
    headers: {
        'xi-api-key': API_KEY
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            try {
                const agent = JSON.parse(data);
                const output = `Name: ${agent.name}\nVoice ID: ${agent.conversation_config?.tts?.voice_id || 'N/A'}\nModel: ${agent.conversation_config?.tts?.model_id || 'N/A'}`;
                const fs = require('fs');
                fs.writeFileSync('agent_config_output.txt', output);
                console.log(output);
            } catch (e) {
                console.error('Error parsing response:', e);
            }
        } else {
            console.error(`Error: Failed to fetch agent. Status Code: ${res.statusCode}`);
            console.error('Response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.end();
