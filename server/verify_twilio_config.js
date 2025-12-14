
require('dotenv').config();
const Twilio = require('twilio');

async function verify() {
    console.log('--- Verifying Twilio Configuration ---');

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const appSid = process.env.TWILIO_TWIML_APP_SID;

    console.log(`Account SID: ${accountSid ? accountSid.substring(0, 6) + '...' : 'MISSING'}`);
    console.log(`Auth Token: ${authToken ? 'PRESENT' : 'MISSING'}`);
    console.log(`API Key: ${apiKey ? apiKey.substring(0, 2) + '...' : 'MISSING'}`);
    console.log(`API Secret: ${apiSecret ? 'PRESENT' : 'MISSING'}`);
    console.log(`TwiML App SID: ${appSid ? appSid.substring(0, 2) + '...' : 'MISSING'}`);

    let errors = [];

    // Check Formats
    if (!accountSid?.startsWith('AC')) errors.push('Account SID should start with "AC"');
    if (!apiKey?.startsWith('SK')) errors.push(`API Key should start with "SK". Found: ${apiKey?.substring(0, 2)}`);
    if (!appSid?.startsWith('AP')) errors.push(`TwiML App SID should start with "AP". Found: ${appSid?.substring(0, 2)}`);

    if (errors.length > 0) {
        console.error('\n❌ Configuration Format Errors:');
        errors.forEach(e => console.error(`- ${e}`));
    } else {
        console.log('\n✅ Credential Formats look correct (prefix check).');
    }

    try {
        const client = Twilio(accountSid, authToken);
        console.log('\nTesting connection to Twilio API...');
        const account = await client.api.accounts(accountSid).fetch();
        console.log(`✅ Successfully authenticated as: ${account.friendlyName}`);
    } catch (error) {
        console.error('\n❌ Connection Failed:', error.message);
    }
}

verify().catch(console.error);
