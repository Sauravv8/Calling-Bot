require('dotenv').config();
const https = require('https');

const API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

const options = {
    hostname: 'api.elevenlabs.io',
    path: `/v1/convai/agents/${AGENT_ID}`,
    method: 'GET',
    headers: { 'xi-api-key': API_KEY }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
        const json = JSON.parse(data);
        console.log('--- Agent Config ---');
        console.log('Name:', json.name);
        console.log('First Message:', json.conversation_config?.agent?.first_message);
        console.log('Prompt:', json.conversation_config?.agent?.prompt?.prompt);
    });
});

req.on('error', e => console.error(e));
req.end();
