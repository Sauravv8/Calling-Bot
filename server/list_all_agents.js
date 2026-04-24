const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const https = require('https');

const API_KEY = process.env.ELEVENLABS_API_KEY;

if (!API_KEY) {
    console.error('Error: ELEVENLABS_API_KEY is missing in .env');
    process.exit(1);
}

console.log('Fetching all agents...');

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
        if (res.statusCode === 200) {
            try {
                const response = JSON.parse(data);
                const fs = require('fs');
                fs.writeFileSync('agents_list.json', JSON.stringify(response, null, 2));
                console.log('Agents saved to agents_list.json');
            } catch (e) {
                console.error('Error parsing response:', e);
            }
        } else {
            console.error(`Error: Failed to fetch agents. Status Code: ${res.statusCode}`);
            console.error('Response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.end();
