const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const ngrok = require('ngrok');

const STATIC_DOMAIN = 'unlayable-vampishly-zaid.ngrok-free.dev';

(async function () {
    try {
        const token = (process.env.NGROK_AUTHTOKEN || '').trim();
        if (!token) {
            console.error('ERROR: NGROK_AUTHTOKEN not set in .env');
            process.exit(1);
        }

        console.log('[ngrok] Connecting with static domain:', STATIC_DOMAIN);

        const url = await ngrok.connect({
            addr: 5000,
            authtoken: token,
            hostname: STATIC_DOMAIN,
        });

        console.log('');
        console.log('✅ ngrok tunnel active!');
        console.log('   Public URL: ' + url);
        console.log('   Forwarding: ' + url + ' → http://localhost:5000');
        console.log('');
        console.log('   BASE_URL in .env:', process.env.BASE_URL);
        console.log('   Twilio webhook will hit:', url + '/voice/start');
        console.log('');

    } catch (e) {
        console.error('[ngrok] ERROR:', e.message || e);
        if (e.message && e.message.includes('hostname')) {
            console.error('');
            console.error('  ⚠️  Static domain not authorized on your ngrok account.');
            console.error('  → Run without domain: ngrok http 5000');
            console.error('  → Then update BASE_URL in .env with the new URL');
        }
        process.exit(1);
    }
})();
