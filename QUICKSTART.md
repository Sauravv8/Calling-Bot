# Quick Start Guide (5 Minutes)

## 🚀 Super Fast Setup

Already have Node.js? This is all you need:

### 1. Open Two PowerShell Windows

### Window 1 - Backend Server
```bash
cd "d:\CODE\Internship V2\cold-calling-app\server"
npm start
```

Wait for: `Server running on port 5000`

### Window 2 - Frontend App
```bash
cd "d:\CODE\Internship V2\cold-calling-app\client"
npm run dev
```

Wait for: `Local: http://localhost:5174/`

### 2. Open Browser
Go to: http://localhost:5174/

### 3. Make Your First Call
1. Click Settings (⚙️) - you can skip this for now
2. Click "Dialer"
3. Type in a number: `+15551234567`
4. Click "Call Now"
5. Click the notes button during call to add status
6. Click "End Call"

Done! ✨

## 📊 Next Steps

- **Import Leads**: Upload an Excel file with Name and Phone columns
- **Configure Twilio**: Add real phone numbers for actual calling
- **Add Gemini**: Get AI-generated call scripts
- **View Results**: Check Generated Leads page

## 🔗 Useful Links

- Frontend: http://localhost:5174/
- Backend API: http://localhost:5000/
- Twilio: https://www.twilio.com/console
- Gemini API: https://aistudio.google.com/

## ⚠️ First Time Only

If you get errors:
1. Install dependencies:
   ```bash
   # In server directory
   npm install
   npm install @google/generative-ai
   
   # In client directory
   npm install --legacy-peer-deps
   ```

2. Restart both servers

Done! Enjoy your cold calling app! 🎉
