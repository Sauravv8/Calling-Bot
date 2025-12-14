require('dotenv').config();
const https = require('https');
const fs = require('fs');

const API_KEY = process.env.ELEVENLABS_API_KEY;

const userOptions = {
    hostname: 'api.elevenlabs.io',
    path: '/v1/user',
    method: 'GET',
    headers: { 'xi-api-key': API_KEY }
};

const req = https.request(userOptions, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
        fs.writeFileSync('creds.json', data);
        console.log('Done.');
    });
});

req.on('error', e => console.error(e));
req.end();
