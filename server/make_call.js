require('dotenv').config();
const twilio = require("twilio");

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function createCall() {
    const fromNumber = process.env.TWILIO_CALLER_ID; // Your Twilio number
    const toNumber = process.env.TO_NUMBER; // Your personal phone number

    if (!fromNumber || !toNumber) {
        console.error("Error: Please check your .env file for TWILIO_CALLER_ID and TO_NUMBER.");
        return;
    }

    console.log(`Initiating call from ${fromNumber} to ${toNumber}...`);

    try {
        const call = await client.calls.create({
            from: fromNumber,
            to: toNumber,
            url: "http://demo.twilio.com/docs/voice.xml", // Plays a default message
        });

        console.log(`Call created successfully! SID: ${call.sid}`);
    } catch (error) {
        console.error("Error creating call:", error.message);
    }
}

createCall();
