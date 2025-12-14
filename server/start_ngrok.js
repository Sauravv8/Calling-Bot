const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const ngrok = require('ngrok');

(async function () {
    try {
        const token = process.env.NGROK_AUTHTOKEN ? process.env.NGROK_AUTHTOKEN.trim() : '';
        console.log('Token length:', token.length);
        console.log('Token starts with:', token.substring(0, 3));

        const url = await ngrok.connect({
            addr: 5000,
            authtoken: token,
        });
        console.log('NGROK_URL_SUCCESS: ' + url);
    } catch (e) {
        console.error('NGROK_ERROR: ' + JSON.stringify(e, null, 2));
        console.error(e);
    }
})();
