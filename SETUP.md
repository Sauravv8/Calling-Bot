# 🚀 Setup Guide - ColdCaller.io

This guide will walk you through setting up the entire Cold Calling application from scratch.

## ✅ Prerequisites

- **Node.js** 20.19+ or 22.12+ (Download from https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional but recommended)
- **Twilio Account** (free trial available at https://www.twilio.com/)
- **Google Gemini API Key** (free at https://aistudio.google.com/)
- **PostgreSQL** (optional, for storing call history)

## 📋 Step-by-Step Setup

### Step 1: Check Node.js Installation

Open PowerShell or Command Prompt and run:
```bash
node --version
npm --version
```

You should see versions like `v20.19.0` or `v22.12.0`.

### Step 2: Navigate to Project Directory

```bash
cd "d:\CODE\Internship V2\cold-calling-app"
```

### Step 3: Install Frontend Dependencies

```bash
cd client
npm install --legacy-peer-deps
```

This will install all required packages for the React frontend.

### Step 4: Install Server Dependencies

```bash
cd ../server
npm install
npm install @google/generative-ai
```

### Step 5: Configure Environment Variables

Create or edit the `.env` file in the `server` directory:

```bash
# Basic Setup (No Twilio)
PORT=5000
BASE_URL=http://localhost:5000
```

#### Optional: Add Twilio Configuration

1. Go to https://www.twilio.com/console
2. Sign up or log in
3. Get your:
   - **Account SID** (under Account Info)
   - **Auth Token** (under Account Info)
   - **Phone Number** (under Phone Numbers > Manage)

Add to `.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_CALLER_ID=+1234567890
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Optional: Add Gemini API Key

1. Go to https://aistudio.google.com/
2. Click "Get API Key"
3. Create new API key for free

Add to `.env`:
```env
GEMINI_API_KEY=AIzaSyDx...
```

## 🎮 Running the Application

### Method 1: Two Terminals (Recommended for Development)

**Terminal 1 - Start Backend Server:**
```bash
cd "d:\CODE\Internship V2\cold-calling-app\server"
npm start
```

Expected output:
```
Server running on port 5000
```

**Terminal 2 - Start Frontend Dev Server:**
```bash
cd "d:\CODE\Internship V2\cold-calling-app\client"
npm run dev
```

Expected output:
```
VITE v7.2.7  ready in xxx ms
➜  Local:   http://localhost:5174/
```

### Method 2: Single Terminal (Sequential)

```bash
# Terminal 1: Start server (keep it running)
cd server
npm start

# Wait for "Server running on port 5000"
# Don't close this terminal

# Terminal 2: Start frontend
cd ../client
npm run dev
```

## 🌐 Accessing the Application

Open your browser and go to:
- **Frontend**: http://localhost:5174/
- **Backend API**: http://localhost:5000/

## 📝 First Time Usage

### 1. Configure Your Settings
- Click the **Settings (⚙️)** icon in the top-right
- Enter your credentials:
  - Twilio Account SID (if you have one)
  - Twilio Auth Token
  - Twilio Phone Number
  - Gemini API Key (if you have one)
  - Custom call prompt (optional)
- Click "Save Settings"

### 2. Import Leads
- Go to **"Import Leads"** page
- Download the example Excel file (or create your own with columns: Name, Phone, Email*, Company*)
- Click to upload or drag-and-drop
- Leads will appear in the dialer queue

### 3. Start Making Calls
- Click **"Dialer"** page
- Select a lead from the left sidebar OR dial manually
- Click "Call Now"
- During the call, click the notes button to add status and notes
- End the call and save

### 4. View Generated Leads
- Go to **"Generated Leads"** page
- See all leads captured from your calls
- Filter, search, and export as CSV

## 🔧 Configuration Details

### Adding Twilio

1. **Create a Twilio Account**
   - Go to https://www.twilio.com/
   - Sign up (free trial)
   
2. **Get Your Credentials**
   - Account SID: https://www.twilio.com/console
   - Auth Token: https://www.twilio.com/console
   - API Key: https://www.twilio.com/console/keys-credentials
   
3. **Buy a Phone Number**
   - Go to https://www.twilio.com/console/phone-numbers
   - Click "Buy a Number"
   - Choose your preferred number

4. **Create a TwiML App**
   - Go to https://www.twilio.com/console/twiml-apps
   - Create new app
   - Set Voice URL to: `http://localhost:5000/voice`
   - Set Webhooks for Status Callbacks to: `http://localhost:5000/events`

5. **Update .env with Your Credentials**

### Adding Gemini API

1. Go to https://aistudio.google.com/
2. Click "Get API Key"
3. Choose or create a Google Cloud Project
4. Copy the API key
5. Add to `.env`: `GEMINI_API_KEY=your_key_here`

### Adding PostgreSQL (Optional)

1. Install PostgreSQL from https://www.postgresql.org/
2. Create a database:
```sql
CREATE DATABASE coldcaller;
CREATE TABLE calls (
  id SERIAL PRIMARY KEY,
  call_sid VARCHAR(255) UNIQUE,
  status VARCHAR(50),
  to_number VARCHAR(20),
  from_number VARCHAR(20),
  recording_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  company VARCHAR(255),
  status VARCHAR(50),
  notes TEXT,
  call_duration INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. Add to `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/coldcaller
```

## 🐛 Troubleshooting

### Issue: "Port 5173/5174 already in use"
**Solution:** Close the other terminal with `npm run dev` or change ports in vite.config.ts

### Issue: "Vite requires Node.js version 20.19+"
**Solution:** This is a warning, not an error. Your app will still work. To fix, upgrade Node.js.

### Issue: Can't import Excel files
**Solution:** 
- Make sure file has "Name" and "Phone" columns
- Try converting to .csv format
- Check browser console for errors

### Issue: Can't make calls
**Solution:**
- Verify Twilio credentials in Settings
- Ensure account has credits
- Check server console for errors
- Phone number format should be like: +15551234567

### Issue: "Cannot find module '@google/generative-ai'"
**Solution:** Run in server directory:
```bash
npm install @google/generative-ai
```

## 📊 Project Structure

```
cold-calling-app/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActiveCall.tsx      # During-call interface
│   │   │   ├── Dialer.tsx          # Phone pad
│   │   │   ├── LeadList.tsx        # Queue of leads
│   │   │   ├── ExcelUpload.tsx     # Excel import
│   │   │   ├── GeneratedLeads.tsx  # Leads from calls
│   │   │   └── Settings.tsx        # Configuration
│   │   ├── App.tsx                 # Main app component
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Styling
│   ├── package.json
│   └── vite.config.ts
│
├── server/                          # Express Backend
│   ├── index.js                    # Main server file
│   ├── .env                        # Environment variables
│   ├── .env.example                # Template
│   └── package.json
│
├── README.md                        # Main documentation
└── SETUP.md                         # This file
```

## 🎓 Learning Resources

- **React**: https://react.dev/
- **Twilio Voice**: https://www.twilio.com/docs/voice
- **Gemini API**: https://ai.google.dev/
- **Express.js**: https://expressjs.com/
- **Tailwind CSS**: https://tailwindcss.com/

## ✨ Features Explained

### Smart Dialer
- Easy phone pad interface
- Manual number entry or select from queue
- Clear and delete buttons
- Automatic formatting

### Lead Import
- Drag-and-drop Excel file upload
- Support for custom columns
- Automatic lead score calculation
- Batch import capability

### Call Recording
- Automatic recording with Twilio
- Recording URL stored in database
- Playback available in generated leads

### AI-Generated Scripts
- Gemini AI generates custom call scripts
- Based on your prompt and lead info
- Dynamic customization per lead

### Lead Management
- Track all leads from calls
- Status: Qualified, Not Interested, Callback Later, Bad Number, No Answer
- Add custom notes during calls
- Filter and search leads
- Export as CSV for CRM integration

## 🔐 Security Tips

1. **Never commit .env file** - Add to .gitignore
2. **Keep API keys secret** - Use environment variables
3. **Use HTTPS** - In production, always use HTTPS
4. **Validate input** - Server validates all inputs
5. **Use strong database passwords** - Change defaults

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review server console output
3. Check browser console (F12)
4. Contact your internship supervisor

---

**You're all set! 🎉 Happy cold calling!**
