require('dotenv').config();
const https = require('https');
const fs = require('fs');

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log('No API Key');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log('Fetching models from API...');

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            const logOutput = `Status: ${res.statusCode}\nBody:\n${data}`;
            fs.writeFileSync('debug_gemini.txt', logOutput);
            console.log('Response saved to debug_gemini.txt');
        });
    }).on('error', (e) => {
        console.error(e);
    });
}

listModels();
