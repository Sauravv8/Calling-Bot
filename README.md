# ColdCaller.io - Cold Calling Application

A modern, user-friendly cold calling application built with React and Express, featuring Excel lead import, Twilio integration, Gemini AI prompts, and lead management.

## 🎯 Features

### Frontend
- **📞 Smart Dialer**: Easy-to-use phone pad interface for making calls
- **📊 Lead Management**: Import leads from Excel files with custom columns
- **🎬 Call Recording**: Automatic call recording with Twilio
- **📝 Call Notes**: Add notes and status updates during calls
- **📈 Lead Tracking**: Track and manage generated leads with filtering and export
- **⚙️ Configuration Panel**: Configure Twilio and Gemini API credentials
- **🤖 Custom Prompts**: Set custom prompts for AI-generated call scripts
- **📱 Responsive Design**: Works on desktop and mobile devices
- **✨ Modern UI**: Glass morphism design with smooth animations

### Backend
- **🔐 Twilio Integration**: Real-time voice calling with call recording
- **🤖 Gemini AI**: Generate call scripts based on custom prompts
- **💾 Database Support**: PostgreSQL integration for call history and leads
- **🔔 Webhooks**: Real-time call event tracking
- **📊 Call Analytics**: Store and retrieve call data

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn
- Twilio Account (optional for production)
- Google Gemini API Key (optional)
- PostgreSQL Database (optional)

### Installation

1. **Clone the repository**
```bash
cd cold-calling-app
```

2. **Install Frontend Dependencies**
```bash
cd client
npm install --legacy-peer-deps
```

3. **Install Server Dependencies**
```bash
cd ../server
npm install
```

### Configuration

#### Environment Variables (Server)
Create a `.env` file in the `server` directory:

```env
# Port Configuration
PORT=5000
BASE_URL=http://localhost:5000

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret
TWILIO_TWIML_APP_SID=your_twiml_app_sid
TWILIO_CALLER_ID=+1234567890

# Gemini AI Configuration (Optional)
GEMINI_API_KEY=your_gemini_api_key

# Database Configuration (Optional)
DATABASE_URL=postgresql://user:password@localhost:5432/coldcaller
```

#### Frontend Configuration
All credentials are configured through the Settings panel in the app:
1. Click the Settings (⚙️) icon in the header
2. Enter your Twilio credentials
3. Enter your Gemini API key
4. Set your custom call prompt
5. Save settings (stored locally in browser)

## 📦 Running the Application

### Development Mode

**Terminal 1 - Backend**
```bash
cd server
npm start
# Server running on http://localhost:5000
```

**Terminal 2 - Frontend**
```bash
cd client
npm run dev
# App running on http://localhost:5174 (or next available port)
```

### Production Build

**Build Frontend**
```bash
cd client
npm run build
# Output in dist/ folder
```

**Run Production Server**
```bash
cd server
npm start
```

## 📖 Usage

### 1. **Import Leads**
- Go to "Import Leads" section
- Upload an Excel file with columns:
  - **Name** (required)
  - **Phone** (required)
  - **Email** (optional)
  - **Company** (optional)
- Leads will be added to your calling queue

### 2. **Configure Settings**
- Click Settings (⚙️) icon
- Add Twilio Account SID, Auth Token, and Phone Number
- Add Gemini API Key
- Set your custom calling prompt (used for AI script generation)
- Save settings

### 3. **Make Calls**
- Select a lead from the left sidebar or dial manually
- Use the keypad or type to enter a number
- Click "Call Now" to initiate the call
- Use Mic/MicOff to toggle microphone
- Click notes button to add call status and notes

### 4. **View Generated Leads**
- Go to "Generated Leads" section
- See all leads captured from your calls
- Filter by status, search by name/phone
- Export as CSV
- View conversion rates and call statistics

## 🔌 API Endpoints

### Authentication
- `POST /token` - Get Twilio token for client-side connections

### Calls
- `POST /voice` - Twilio TwiML response endpoint
- `POST /events` - Webhook for call events
- `GET /calls` - Get call history

### Leads
- `POST /leads` - Save a generated lead
- `GET /leads` - Get all generated leads

### AI
- `POST /generate-script` - Generate call script with Gemini AI

### Health
- `GET /health` - Server health check

## 📊 Database Schema

### Calls Table
```sql
CREATE TABLE calls (
  id SERIAL PRIMARY KEY,
  call_sid VARCHAR(255) UNIQUE,
  status VARCHAR(50),
  to_number VARCHAR(20),
  from_number VARCHAR(20),
  recording_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Leads Table
```sql
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

## 🛡️ Security Considerations

- **Credentials**: Stored locally in browser localStorage (frontend) or environment variables (backend)
- **API Keys**: Never exposed in client-side code
- **CORS**: Configured for secure cross-origin requests
- **Helmet**: Security headers enabled on server
- **Database**: Use strong credentials and SSL connections in production

## 🐛 Troubleshooting

### Vite Node.js Version Warning
This is just a warning. The app will still work on Node.js 20.17.0. Upgrade to 20.19+ or 22.12+ to remove the warning.

### Calls Not Connecting
1. Verify Twilio credentials in Settings
2. Check that Twilio account has sufficient credits
3. Ensure phone number format is correct (+1234567890)
4. Check server logs for Twilio API errors

### Excel Import Not Working
1. Ensure Excel file has "Name" and "Phone" columns
2. Check that phone numbers are formatted correctly
3. Try converting to .csv if .xlsx doesn't work

### Database Not Storing Data
1. Verify DATABASE_URL environment variable
2. Ensure PostgreSQL is running
3. Check that tables are created
4. Review server logs for connection errors

## 🔧 Development

### Project Structure
```
cold-calling-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActiveCall.tsx
│   │   │   ├── Dialer.tsx
│   │   │   ├── LeadList.tsx
│   │   │   ├── ExcelUpload.tsx
│   │   │   ├── GeneratedLeads.tsx
│   │   │   └── Settings.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── index.js
│   ├── package.json
│   └── .env
└── README.md
```

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **APIs**: Twilio SDK, Google Generative AI
- **Database**: PostgreSQL (optional)
- **Styling**: Tailwind CSS with custom glass morphism

## 📝 License

This project is provided as-is for use in your internship.

## 🤝 Support

For issues or questions, contact your internship supervisor.

---

**Happy Calling! 📞**
