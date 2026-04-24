const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const https = require('https');
const fs = require('fs');

const API_KEY = process.env.ELEVENLABS_API_KEY;
const ENV_AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

if (!API_KEY) {
    console.error('Missing ELEVENLABS_API_KEY');
    process.exit(1);
}

const agentsFile = path.join(__dirname, '../agents_list.json');
let agentsList = [];

try {
    const data = fs.readFileSync(agentsFile, 'utf8');
    agentsList = JSON.parse(data).agents;
} catch (e) {
    console.error('Could not read agents_list.json. Run list_all_agents.js first.');
    process.exit(1);
}

console.log(`Current ENV Agent ID: ${ENV_AGENT_ID}`);

agentsList.forEach(agent => {
    const options = {
        hostname: 'api.elevenlabs.io',
        path: `/v1/convai/agents/${agent.agent_id}`,
        method: 'GET',
        headers: { 'xi-api-key': API_KEY }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                const details = JSON.parse(data);
                const voiceId = details.conversation_config?.voice?.id || details.conversation_config?.tts?.voice_id || 'Unknown';
                const isMatch = agent.agent_id === ENV_AGENT_ID ? ' [CURRENT ENV]' : '';
                console.log(`Agent: ${details.name} (ID: ${agent.agent_id})${isMatch}`);
                console.log(`  - Voice ID: ${voiceId}`);
            }
        });
    });

    req.on('error', e => console.error(e));
    req.end();
});
