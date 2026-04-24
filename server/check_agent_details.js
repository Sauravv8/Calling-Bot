const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const https = require('https');

const API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

if (!API_KEY || !AGENT_ID) {
    console.error('Missing ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID');
    process.exit(1);
}

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
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            const agent = JSON.parse(data);
            console.log('Agent Name:', agent.name);
            // console.log('Agent Config:', JSON.stringify(agent.conversation_config, null, 2));

            const config = agent.conversation_config;
            if (config.voice) {
                console.log('Voice Config found:', JSON.stringify(config.voice, null, 2));
            } else if (config.tts) {
                console.log('TTS Config found:', JSON.stringify(config.tts, null, 2));
            } else {
                console.log('No Voice or TTS config found in conversation_config. Keys:', Object.keys(config));
            }
        } else {
            console.error(`Error ${res.statusCode}: ${data}`);
        }
    });
});

req.on('error', e => console.error(e));
req.end();
