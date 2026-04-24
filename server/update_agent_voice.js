const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const https = require('https');

const API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID;
const JESSICA_VOICE_ID = "cgSgspJ2msm6clMCkdW9";

if (!API_KEY || !AGENT_ID) {
    console.error('Missing credentials');
    process.exit(1);
}

const payload = JSON.stringify({
    conversation_config: {
        tts: {
            voice_id: JESSICA_VOICE_ID
        }
    }
});

const options = {
    hostname: 'api.elevenlabs.io',
    path: `/v1/convai/agents/${AGENT_ID}`,
    method: 'PATCH',
    headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': payload.length
    }
};

console.log(`Updating Agent ${AGENT_ID} to use Voice ${JESSICA_VOICE_ID}...`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('Success! Agent voice updated.');
            console.log('Response:', data);
        } else {
            console.error(`Error ${res.statusCode}: ${data}`);
        }
    });
});

req.on('error', e => console.error(e));
req.write(payload);
req.end();
