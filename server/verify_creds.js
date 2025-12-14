require('dotenv').config();
const https = require('https');

const API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

console.log('--- Verifying Credentials ---');
console.log(`API Key: ${API_KEY ? 'Present (' + API_KEY.substring(0, 5) + '...)' : 'Missing'}`);
console.log(`Agent ID: ${AGENT_ID}`);

if (!API_KEY || !AGENT_ID) process.exit(1);

// 1. Check User/Subscription
const userOptions = {
    hostname: 'api.elevenlabs.io',
    path: '/v1/user',
    method: 'GET',
    headers: { 'xi-api-key': API_KEY }
};

const checkUser = new Promise((resolve) => {
    const req = https.request(userOptions, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
            if (res.statusCode === 200) {
                const json = JSON.parse(data);
                console.log('[PASS] API Key is valid.');
                console.log('--- Subscription Details ---');
                console.log(JSON.stringify(json.subscription, null, 2));
                resolve(true);
            } else {
                console.error(`[FAIL] API Key Check Failed: ${res.statusCode} ${data}`);
                resolve(false);
            }
        });
    });
    req.on('error', e => console.error('[ERROR] User Check:', e.message));
    req.end();
});

// 2. Check Agent
const checkAgent = new Promise((resolve) => {
    const agentOptions = {
        hostname: 'api.elevenlabs.io',
        path: `/v1/convai/agents/${AGENT_ID}`,
        method: 'GET',
        headers: { 'xi-api-key': API_KEY }
    };

    const req = https.request(agentOptions, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
            if (res.statusCode === 200) {
                const json = JSON.parse(data);
                console.log('[PASS] Agent ID found.');
                console.log(`       Name: ${json.name}`);
                console.log(`       First Msg: ${json.conversation_config?.agent?.first_message || '(None)'}`);
                resolve(true);
            } else {
                console.error(`[FAIL] Agent Check Failed: ${res.statusCode} ${data}`);
                resolve(false);
            }
        });
    });
    req.on('error', e => console.error('[ERROR] Agent Check:', e.message));
    req.end();
});

Promise.all([checkUser, checkAgent]).then(() => console.log('--- Verification Complete ---'));
