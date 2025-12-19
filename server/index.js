const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const Twilio = require('twilio');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// PCC: Global Request Logger
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// In-memory settings store (Single User Mode)
let userSettings = {
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_CALLER_ID,
  twilioTwimlAppSid: process.env.TWILIO_TWIML_APP_SID,
  twilioApiKey: process.env.TWILIO_API_KEY,
  twilioApiSecret: process.env.TWILIO_API_SECRET,
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenLabsAgentId: process.env.ELEVENLABS_AGENT_ID,
  baseUrl: process.env.BASE_URL,
  systemPrompt: process.env.SYSTEM_PROMPT || "You are a helpful assistant found in a cold calling context. Be professional and concise."
};

// PCC: Sanitize BASE_URL if it contains multiple values (common configuration error)
if (userSettings.baseUrl && userSettings.baseUrl.includes(',')) {
  console.warn(`[Config Warning] BASE_URL contains multiple values ("\${userSettings.baseUrl}"). Using the last one.`);
  const urls = userSettings.baseUrl.split(',');
  userSettings.baseUrl = urls[urls.length - 1].trim();
  console.log(`[Config Correction] Active BASE_URL set to: \${userSettings.baseUrl}`);
}

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let isDbConnected = false;
pool.connect().then(client => {
  isDbConnected = true;
  console.log('[Database] Connected to PostgreSQL');
  client.release();
}).catch(err => {
  console.log('[Database] Failed to connect (running in non-persistent mode):', err.message);
  isDbConnected = false;
});

// Routes
app.get('/', (req, res) => {
  res.send('Cold Calling App Backend Running');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Update Settings Endpoint
app.post('/settings', (req, res) => {
  const {
    twilioAccountSid,
    twilioAuthToken,
    twilioPhoneNumber,
    twilioTwimlAppSid,
    twilioApiKey,
    twilioApiSecret,
    elevenLabsApiKey,
    elevenLabsAgentId,
    baseUrl,
    systemPrompt
  } = req.body;

  userSettings = {
    ...userSettings,
    twilioAccountSid: twilioAccountSid || userSettings.twilioAccountSid,
    twilioAuthToken: twilioAuthToken || userSettings.twilioAuthToken,
    twilioPhoneNumber: twilioPhoneNumber || userSettings.twilioPhoneNumber,
    twilioTwimlAppSid: twilioTwimlAppSid || userSettings.twilioTwimlAppSid,
    twilioApiKey: twilioApiKey || userSettings.twilioApiKey,
    twilioApiSecret: twilioApiSecret || userSettings.twilioApiSecret,
    elevenLabsApiKey: elevenLabsApiKey || userSettings.elevenLabsApiKey,
    elevenLabsAgentId: elevenLabsAgentId || userSettings.elevenLabsAgentId,
    baseUrl: baseUrl || userSettings.baseUrl,
    systemPrompt: systemPrompt || userSettings.systemPrompt
  };

  // Persist to .env file
  const envContent = Object.entries({
    PORT: process.env.PORT || 5000,
    DATABASE_URL: process.env.DATABASE_URL,
    TWILIO_ACCOUNT_SID: userSettings.twilioAccountSid,
    TWILIO_AUTH_TOKEN: userSettings.twilioAuthToken,
    TWILIO_API_KEY: userSettings.twilioApiKey,
    TWILIO_API_SECRET: userSettings.twilioApiSecret,
    TWILIO_TWIML_APP_SID: userSettings.twilioTwimlAppSid,
    TWILIO_CALLER_ID: userSettings.twilioPhoneNumber,
    ELEVENLABS_API_KEY: userSettings.elevenLabsApiKey,
    ELEVENLABS_AGENT_ID: userSettings.elevenLabsAgentId,
    BASE_URL: userSettings.baseUrl,
    SYSTEM_PROMPT: userSettings.systemPrompt ? userSettings.systemPrompt.replace(/\n/g, '\\n') : ''
  })
    .filter(([_, v]) => v !== undefined) // Keep existing keys even if undefined in settings (like PORT)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  try {
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    console.log('Settings saved to .env file');
  } catch (err) {
    console.error('Failed to save .env:', err);
  }

  console.log('Settings updated in memory');

  res.json({ success: true, message: 'Settings updated successfully' });
});

// Get Settings (Sanitized)
app.get('/settings', (req, res) => {
  res.json({
    twilioPhoneNumber: userSettings.twilioPhoneNumber,
    baseUrl: userSettings.baseUrl,
    systemPrompt: userSettings.systemPrompt,
    hasElevenLabsKey: !!userSettings.elevenLabsApiKey,
    hasElevenLabsAgentId: !!userSettings.elevenLabsAgentId,
    hasTwilioCreds: !!userSettings.twilioAccountSid && !!userSettings.twilioAuthToken,
    hasTwiMLAppSid: !!userSettings.twilioTwimlAppSid
  });
});

// --- ELEVENLABS AI VOICE SECTION ---

const WebSocket = require('ws');

// 1. Initial Call Handler - Called by Twilio when call connects
app.post('/voice/start', (req, res) => {
  const { CallSid } = req.body;
  const leadName = req.query.name || 'there';
  const leadCompany = req.query.company || 'your company';

  console.log(`[Voice Start] Call connected. SID: ${CallSid}, Name: ${leadName}`);

  const response = new Twilio.twiml.VoiceResponse();
  const connect = response.connect();
  const stream = connect.stream({
    url: `wss://${req.headers.host}/outbound-media-stream`,
    track: 'inbound_track' // Name of the track
  });

  // Pass custom parameters to the stream (Lead Context)
  // Note: standard TwiML <Stream> doesn't support query params in the URL easily for all regions,
  // but we can pass them via <Parameter> tags if using <Connect><Stream>.
  stream.parameter({ name: 'leadName', value: leadName });
  stream.parameter({ name: 'leadCompany', value: leadCompany });

  res.type('text/xml');
  res.send(response.toString());
});

// WebSocket Server for Media Streams
const wss = new WebSocket.Server({ noServer: true });

// Handle the upgrade in the main app listen (will be attached below)
// We need to export this function or attach it to the server instance

// WebSocket Connection Handler
wss.on('connection', (ws, req) => {
  console.log('[WebSocket] New Twilio Stream Connection');

  let streamSid = null;
  let elevenLabsWs = null;
  let leadName = 'Candidate';
  let leadCompany = 'Company';
  // PCC: Flag to track if ElevenLabs is ready to receive audio
  let isElevenLabsReady = false;

  ws.on('error', (error) => {
    console.error('[Twilio] WebSocket Error:', error);
    if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
      elevenLabsWs.close();
    }
  });

  // Helper to connect to ElevenLabs
  const connectElevenLabs = () => {
    // PCC: Use userSettings so updates from UI are reflected immediately
    const ELEVENLABS_API_KEY = userSettings.elevenLabsApiKey;
    const ELEVENLABS_AGENT_ID = userSettings.elevenLabsAgentId;

    console.log(`[ElevenLabs] Connecting with Agent ID: ${ELEVENLABS_AGENT_ID}`);

    if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID) {
      console.error('[Configuration Error] Missing ElevenLabs credentials');
      return;
    }

    // PCC: Force ulaw_8000 for Twilio compatibility (Output Only)
    // We MUST specify input_format=ulaw_8000 so ElevenLabs knows we are sending Twilio's format.
    const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${ELEVENLABS_AGENT_ID}&output_format=ulaw_8000&input_format=ulaw_8000`;

    // PCC: Add API Key header for Private Agents
    elevenLabsWs = new WebSocket(wsUrl, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    });

    // Reset flag on new connection
    isElevenLabsReady = false;

    elevenLabsWs.on('open', () => {
      console.log('[ElevenLabs] Connected to Conversational AI');

      // Send initial configuration
      // PCC: Sanitize prompt to ensure newlines are treated correctly
      const rawPrompt = userSettings.systemPrompt || process.env.SYSTEM_PROMPT || "You are a helpful assistant.";
      const sanitizedPrompt = rawPrompt.replace(/\\n/g, '\n');

      const initialConfig = {
        type: "conversation_initiation_client_data"
      };

      console.log('[ElevenLabs] Sending initial config...');
      elevenLabsWs.send(JSON.stringify(initialConfig));

      // Do NOT flush audio here. Wait for metadata event.
    });

    elevenLabsWs.on('close', (code, reason) => {
      console.log(`[ElevenLabs] Disconnected. Code: ${code}, Reason: ${reason}`);
    });

    elevenLabsWs.on('error', (error) => {
      console.error('[ElevenLabs] WebSocket Error:', error);
    });

    elevenLabsWs.on('message', (data) => {
      try {
        const message = JSON.parse(data);

        if (message.type === 'conversation_initiation_metadata') {
          console.log('[ElevenLabs] Received metadata. session is ready.');
          isElevenLabsReady = true;

          // Flush any buffered audio NOW
          // Flush any buffered audio (Concatenated)
          if (elevenLabsWs.audioBuffer && elevenLabsWs.audioBuffer.length > 0) {
            console.log(`[ElevenLabs] Flushing ${elevenLabsWs.audioBuffer.length} chunks...`);

            // Re-combine all buffered PCM fragments into one big buffer
            // Our buffer currently stores Base64 strings.
            // Efficient way: Calc total size, alloc, and copy.
            const chunks = elevenLabsWs.audioBuffer.map(c => Buffer.from(c, 'base64'));
            const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);

            if (totalLength > 0) {
              const combinedBuffer = Buffer.concat(chunks, totalLength);
              console.log(`[ElevenLabs] Flushed combined buffer: ${totalLength} bytes`);
              elevenLabsWs.send(JSON.stringify({
                user_audio_chunk: combinedBuffer.toString('base64')
              }));
            }
            elevenLabsWs.audioBuffer = [];
          }
        }

        if (message.audio_event?.audio_base_64) {
          // PCC: Manual Transcoding (16kHz PCM -> 8kHz u-law)
          // Reason: Conversational API ignores output_format=ulaw_8000 (sends PCM-16k).
          try {
            // 1. Convert Base64 -> Buffer (Linear PCM 16-bit little-endian)
            const pcmBuffer = Buffer.from(message.audio_event.audio_base_64, 'base64');
            const pcmInt16 = new Int16Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.length / 2);

            // 2. Downsample (16kHz -> 8kHz) and Encode (u-law)
            // We only take every 2nd sample (simple decimation)
            const mulawBuffer = Buffer.alloc(pcmInt16.length / 2);

            for (let i = 0; i < mulawBuffer.length; i++) {
              const sample = pcmInt16[i * 2]; // Downsample: skipping signals
              mulawBuffer[i] = linear16ToMulaw(sample); // Encode
            }

            const payload = {
              event: 'media',
              streamSid: streamSid,
              media: {
                payload: mulawBuffer.toString('base64')
              }
            };
            ws.send(JSON.stringify(payload));

          } catch (e) {
            console.error('[Transcoding] Error converting audio:', e);
          }
        }

        // Handle Interruption (User spoke, EL stopped)
        if (message.type === 'interruption') {
          console.log('[ElevenLabs] Interruption detected');
          ws.send(JSON.stringify({ event: 'clear', streamSid: streamSid }));
        }

        if (message.type === 'ping') {
          // PCC: Correct Ping/Pong Handling (Must echo event_id)
          const eventId = message.ping_event?.event_id;
          if (eventId) {
            elevenLabsWs.send(JSON.stringify({
              type: 'pong',
              event_id: eventId
            }));
          } else {
            elevenLabsWs.send(JSON.stringify({ type: 'pong' }));
          }
        }

      } catch (error) {
        console.error('[ElevenLabs] Error parsing message:', error);
      }
    });

    // ... (rest of callbacks)
  };

  // Handle messages from Twilio -> Server (-> ElevenLabs)
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);

      if (msg.event === 'start') {
        streamSid = msg.start.streamSid;
        console.log(`[Twilio] Stream started: ${streamSid}`);

        // Extract custom parameters
        const customParams = msg.start.customParameters;
        if (customParams) {
          leadName = customParams.leadName || leadName;
          leadCompany = customParams.leadCompany || leadCompany;
        }

        connectElevenLabs();
      }
      else if (msg.event === 'media') {
        // Receive audio from Twilio and send to ElevenLabs
        if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN && isElevenLabsReady) {
          // PCC: Transcode Twilio (8kHz u-law) -> ElevenLabs (16kHz PCM)
          if (!msg.media.payload || msg.media.payload.length === 0) return;
          try {
            const mulawData = Buffer.from(msg.media.payload, 'base64');
            if (mulawData.length === 0) return;
            // Target: 16kHz (2x sample rate), 16-bit (2 bytes per sample)
            const pcmBuffer = Buffer.alloc(mulawData.length * 2 * 2);

            // 2. Downsample (16kHz -> 8kHz) and Encode (u-law)
            // We only take every 2nd sample (simple decimation)
            // NOT NEEDED HERE. This block is ElevenLabs -> Twilio. (Already Fixed)
            // Wait, I am editing the wrong block? No, line 314-347 is INPUT (Twilio -> EL) in my memory? 
            // Let me re-read the file context carefully.
            // ...
            // Ah, looking at the previous diff:
            // if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN && isElevenLabsReady) {
            // ...
            // for (let i = 0; i < mulawData.length; i++) {
            //   const sample = mulawToLinear16(mulawData[i]);
            //   pcmBuffer.writeInt16LE(sample, i * 4);
            // }
            // THIS IS INPUT. OK.

            let totalEnergy = 0;
            for (let i = 0; i < mulawData.length; i++) {
              totalEnergy += Math.abs(mulawToLinear16(mulawData[i]));
            }

            // PCC: Transcode Twilio (8kHz u-law) -> ElevenLabs (16kHz PCM)
            // Reason: Conversational API expects PCM-16k (ignores input_format in some cases).
            if (!msg.media.payload || msg.media.payload.length === 0) return;
            try {
              const mulawData = Buffer.from(msg.media.payload, 'base64');
              if (mulawData.length === 0) return;

              // Target: 16kHz (2x sample rate), 16-bit (2 bytes per sample)
              const pcmBuffer = Buffer.alloc(mulawData.length * 2 * 2);

              let totalEnergy = 0;
              for (let i = 0; i < mulawData.length; i++) {
                const sample = mulawToLinear16(mulawData[i]);
                totalEnergy += Math.abs(sample);

                // Upsample 8k -> 16k by nearest neighbor interpolation
                pcmBuffer.writeInt16LE(sample, i * 4);
                pcmBuffer.writeInt16LE(sample, i * 4 + 2);
              }

              // PCC: Noise Gate. 
              const averageEnergy = totalEnergy / mulawData.length;

              // DEBUG LOG:
              console.log(`[Input] Energy: ${averageEnergy.toFixed(2)}`);

              // PCC: Disabled Noise Gate (Let ElevenLabs VAD handle silence)
              // if (averageEnergy < 50) return;

              const audioPayload = {
                user_audio_chunk: pcmBuffer.toString('base64')
              };
              elevenLabsWs.send(JSON.stringify(audioPayload));

            } catch (e) {
              console.error('[Input Transcoding] Error:', e);
            }

          } catch (e) {
            console.error('[Outer Input Error]:', e);
          }

        } else if (elevenLabsWs && (elevenLabsWs.readyState === WebSocket.CONNECTING || !isElevenLabsReady)) {
          // PCC: Buffer incoming audio (transcoded)
          if (!msg.media.payload || msg.media.payload.length === 0) return;
          try {
            // PCC: Buffer incoming audio (transcoded)
            // Need to store PCM Base64 because we flush to EL which expects PCM
            const mulawData = Buffer.from(msg.media.payload, 'base64');
            if (mulawData.length === 0) return;

            const pcmBuffer = Buffer.alloc(mulawData.length * 2 * 2);
            let totalEnergy = 0;
            for (let i = 0; i < mulawData.length; i++) {
              const sample = mulawToLinear16(mulawData[i]);
              totalEnergy += Math.abs(sample);
              pcmBuffer.writeInt16LE(sample, i * 4);
              pcmBuffer.writeInt16LE(sample, i * 4 + 2);
            }

            const averageEnergy = totalEnergy / mulawData.length;

            // LOGGING BUFFER
            // console.log(`[Buffer] Energy: ${averageEnergy.toFixed(2)}`);

            if (averageEnergy < 50) return;

            if (!elevenLabsWs.audioBuffer) {
              elevenLabsWs.audioBuffer = [];
            }
            elevenLabsWs.audioBuffer.push(pcmBuffer.toString('base64'));

          } catch (e) {
            console.error('[Input Buffer Transcoding] Error:', e);
          }
        } else {
          // Dropping audio chunk silently
        }
      }
      else if (msg.event === 'stop') {
        console.log(`[Twilio] Stream stopped: ${streamSid}`);
        if (elevenLabsWs) elevenLabsWs.close();
      }
    } catch (error) {
      console.error('[Twilio] Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('[Twilio] WebSocket disconnected');
    if (elevenLabsWs) elevenLabsWs.close();
  });
});



// Twilio Voice Response (Legacy/Manual Dialer)
app.post('/voice', (req, res) => {
  const VoiceResponse = Twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  const { To } = req.body;

  if (To) {
    const dial = response.dial({
      callerId: userSettings.twilioPhoneNumber,
      record: 'record-from-ringing-dual',
      statusCallback: `${userSettings.baseUrl}/events`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });
    dial.number(To);
  } else {
    response.say('Invalid request. No number provided.');
  }

  res.type('text/xml');
  res.send(response.toString());
});

// Get Twilio Token
app.post('/token', (req, res) => {
  if (!userSettings.twilioAccountSid || !userSettings.twilioApiKey || !userSettings.twilioApiSecret) {
    return res.status(500).json({ error: 'Twilio credentials missing in settings' });
  }

  const AccessToken = Twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: userSettings.twilioTwimlAppSid,
    incomingAllow: true,
  });

  const token = new AccessToken(
    userSettings.twilioAccountSid,
    userSettings.twilioApiKey,
    userSettings.twilioApiSecret,
    { identity: 'agent' }
  );

  token.addGrant(voiceGrant);
  res.json({ token: token.toJwt() });
});

// Make Autonomous Call (Server-Side)
app.post('/make-call', async (req, res) => {
  const { number, name } = req.body;

  console.log('[DEBUG] /make-call hit with:', { number, name });
  console.log('[DEBUG] Credentials present:', {
    sid: !!userSettings.twilioAccountSid,
    token: !!userSettings.twilioAuthToken,
    phone: !!userSettings.twilioPhoneNumber
  });

  if (!userSettings.twilioAccountSid || !userSettings.twilioAuthToken || !userSettings.twilioPhoneNumber) {
    console.error('[DEBUG] Missing credentials in userSettings!');
    return res.status(500).json({ error: 'Twilio credentials missing. Please check .env or Settings page.' });
  }

  try {
    const client = Twilio(userSettings.twilioAccountSid, userSettings.twilioAuthToken);

    const call = await client.calls.create({
      url: `${userSettings.baseUrl}/voice/start?name=${encodeURIComponent(name || '')}`,
      to: number,
      from: userSettings.twilioPhoneNumber,
      statusCallback: `${userSettings.baseUrl}/events`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });

    console.log(`[Call Started] SID: ${call.sid} -> ${number}`);
    res.json({ success: true, callSid: call.sid });

  } catch (err) {
    console.error('Call failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Call Events (Webhook from Twilio)
app.post('/events', (req, res) => {
  const { CallSid, CallStatus, To, From, RecordingUrl } = req.body;

  console.log(`Call Event - SID: ${CallSid}, Status: ${CallStatus}, To: ${To}, From: ${From}`);

  // Log call data to database if available
  if (isDbConnected && process.env.DATABASE_URL) {
    const query = `
      INSERT INTO calls (call_sid, status, to_number, from_number, recording_url, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (call_sid) DO UPDATE SET status = $2
    `;
    // Suppress repeated connection errors
    pool.query(query, [CallSid, CallStatus, To, From, RecordingUrl]).catch(err => {
      if (!err.message || !err.message.includes('ECONNREFUSED')) {
        console.error('Database error:', err);
      }
    });
  }

  res.json({ success: true });
});

// Get Call History
app.get('/calls', async (req, res) => {
  try {
    if (isDbConnected && process.env.DATABASE_URL) {
      const result = await pool.query('SELECT * FROM calls ORDER BY created_at DESC LIMIT 100');
      res.json(result.rows);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save Lead
app.post('/leads', async (req, res) => {
  const { name, phone, email, company, status, notes, call_duration } = req.body;

  try {
    if (isDbConnected && process.env.DATABASE_URL) {
      const query = `
        INSERT INTO leads (name, phone, email, company, status, notes, call_duration, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `;
      const result = await pool.query(query, [name, phone, email, company, status, notes, call_duration]);
      res.json(result.rows[0]);
    } else {
      res.json({ id: Date.now(), name, phone, email, company, status, notes, call_duration });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

// Bulk Import Leads
app.post('/leads/bulk', async (req, res) => {
  const { leads } = req.body; // Array of { name, phone, ... }

  if (!Array.isArray(leads)) {
    return res.status(400).json({ error: "Invalid format. Expected 'leads' array." });
  }

  try {
    const savedLeads = [];
    if (isDbConnected && process.env.DATABASE_URL) {
      // Simple loop for MVP. Ideally use a transaction or bulk insert query.
      for (const lead of leads) {
        const query = `
                INSERT INTO leads (name, phone, email, company, status, created_at)
                VALUES ($1, $2, $3, $4, 'New', NOW())
                RETURNING *
            `;
        const result = await pool.query(query, [lead.name, lead.phone, lead.email || '', lead.company || '']);
        savedLeads.push(result.rows[0]);
      }
    } else {
      // In-memory mock
      savedLeads.push(...leads.map((l, i) => ({ ...l, id: Date.now() + i, status: 'New' })));
    }
    res.json({ success: true, count: savedLeads.length, leads: savedLeads });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to save leads' });
  }
});

// Get Leads
app.get('/leads', async (req, res) => {
  try {
    if (isDbConnected && process.env.DATABASE_URL) {
      const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC LIMIT 1000');
      res.json(result.rows);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle WebSocket Upgrade
server.on('upgrade', (request, socket, head) => {
  console.log(`[Server] Upgrading to WebSocket: ${request.url}`);

  if (request.url.includes('/outbound-media-stream')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    // socket.destroy(); // Optional: destroy if path mismatch, but for dev safety let's just log
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// PCC: Standard G.711 Mu-Law Compression Table/Logic
// Converts a 16-bit linear PCM sample to 8-bit u-law
function linear16ToMulaw(sample) {
  const BIAS = 0x84;
  const CLIP = 32635;

  let sign = (sample >> 8) & 0x80;
  if (sample < 0) {
    sample = -sample;
    // sample = ~sample; // For some reason standard G.711 implementations flip it? 
    // Actually, simple magnitude is clearer:
    // let sign = 0; if (sample<0) {sample = -sample; sign=0x80;}
    // But let's stick to the bitwise standard implementation below:
  }
  // Let's use a simpler verified logic for NodeJS
  if (sample < 0) sample = -sample;
  if (sample > CLIP) sample = CLIP;
  sample += BIAS;
  let exponent = 7;
  // Determine exponent
  // const muLawMap = [
  //     { max: 32635, exp: 7 }, { max: 16383, exp: 6 }, { max: 8191, exp: 5 },
  //     { max: 4095, exp: 4 }, { max: 2047, exp: 3 }, { max: 1023, exp: 2 },
  //     { max: 511, exp: 1 }, { max: 255, exp: 0 }
  // ];

  let mask = 0x2000;
  let exp = 7;
  for (; exp >= 0; --exp) {
    if ((sample & mask) !== 0) break;
    mask >>= 1;
  }

  let mantissa = (sample >> (exp + 3)) & 0x0F;
  let byte = (exp << 4) | mantissa;
  return ~(sign | byte);
}

// PCC: Helper to convert 8-bit u-law to 16-bit linear PCM
function mulawToLinear16(muEncodedByte) {
  const BIAS = 0x84;
  // Flip all bits
  muEncodedByte = ~muEncodedByte;

  // Extract components
  let sign = (muEncodedByte & 0x80);
  let exponent = (muEncodedByte >> 4) & 0x07;
  let mantissa = (muEncodedByte & 0x0F);

  // G.711 expansion
  let sample = ((mantissa << 3) + BIAS) << exponent;
  sample -= BIAS;

  return sign ? -sample : sample;
}
