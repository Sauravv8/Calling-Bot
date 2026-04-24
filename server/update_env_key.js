const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const keyToUpdate = 'ELEVENLABS_AGENT_ID';
const newValue = 'agent_0701kd895j37ehf97fm36ehjhv6s';

try {
    let content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    let found = false;
    const newLines = lines.map(line => {
        if (line.trim().startsWith(`${keyToUpdate}=`)) {
            found = true;
            return `${keyToUpdate}=${newValue}`;
        }
        return line;
    });

    if (!found) {
        newLines.push(`${keyToUpdate}=${newValue}`);
    }

    fs.writeFileSync(envPath, newLines.join('\n'));
    console.log(`Updated ${keyToUpdate} in .env`);
} catch (e) {
    console.error('Error updating .env:', e);
}
