require('dotenv').config();
const https = require('https');
const fs = require('fs');

const API_KEY = process.env.ELEVENLABS_API_KEY;

const options = {
    hostname: 'api.elevenlabs.io',
    path: '/v1/convai/agents',
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
        fs.writeFileSync('debug_agents_raw.txt', `Status: ${res.statusCode}\nData: ${data}`);
        console.log('Done writing raw response.');
    });
});

req.on('error', (e) => {
    fs.writeFileSync('debug_error.txt', e.message);
});

req.end();
