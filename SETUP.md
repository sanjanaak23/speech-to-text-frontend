# 🚀 Quick Setup Guide

## Prerequisites
- Node.js 16+ and npm
- OpenAI API key (required)

## 🛠️ Setup Steps

### 1. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the API key (starts with `sk-`)

### 2. Configure Backend
1. Open `backend/.env` file
2. Replace `your_openai_api_key_here` with your actual API key:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

### 3. Start the Application
```bash
# Option 1: Use the startup script (recommended)
./start.sh

# Option 2: Start manually
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

### 4. Open Your Browser
Navigate to `http://localhost:3000` (or the port shown in your terminal)

## 🎯 Usage
1. **Record Audio**: Click "Start Recording" and speak clearly
2. **Upload File**: Drag and drop an audio file (WAV, MP3, WebM, OGG)
3. **Get Results**: Your transcription will appear automatically

## 🔧 Optional: Supabase Setup (for history)
If you want to save transcription history:
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Add your Supabase URL and key to `backend/.env`
4. Run the SQL from the main README to create the database table

## ❗ Troubleshooting

**"OpenAI API key is required"**
- Make sure you've added your API key to `backend/.env`
- Ensure there are no spaces around the `=` sign
- The key should start with `sk-`

**"Network error"** 
- Make sure the backend is running on port 5000
- Check if any other application is using port 5000

**"Could not access microphone"**
- Allow microphone permissions in your browser
- Use HTTPS in production environments

## 💡 Tips
- Speak clearly and avoid background noise for better accuracy
- The application works best with audio files under 25MB
- You can use both recording and file upload in the same session