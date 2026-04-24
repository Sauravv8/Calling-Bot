const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const https = require('https');

const API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

if (!API_KEY || !AGENT_ID) {
    console.error('Missing credentials');
    process.exit(1);
}

const options = {
    hostname: 'api.elevenlabs.io',
    path: `/v1/convai/agents/${AGENT_ID}`,
    method: 'GET',
    headers: { 'xi-api-key': API_KEY }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            const agent = JSON.parse(data);
            const config = agent.conversation_config;
            let voiceId = 'Unknown';

            if (config.voice) voiceId = config.voice.id;
            else if (config.tts) voiceId = config.tts.voice_id;

            console.log(`Agent Name: ${agent.name}`);
            console.log(`Current Voice ID: ${voiceId}`);

            if (voiceId === 'cjVigY5qzO86Huf0OWal') console.log('Result: STILL ERIC');
            else if (voiceId === 'cgSgspJ2msm6clMCkdW9') console.log('Result: IS JESSICA');
            else console.log('Result: OTHER VOICE');

        } else {
            console.error(`Error ${res.statusCode}: ${data}`);
        }
    });
});
req.end();
