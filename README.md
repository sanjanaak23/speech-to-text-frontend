# 🎤 SpeechCraft AI - Voice to Text Transcription

A beautiful, modern speech-to-text application powered by OpenAI's Whisper API. Record audio directly in your browser or upload audio files to get accurate AI-powered transcriptions instantly.

![SpeechCraft AI](https://via.placeholder.com/800x400/ff69b4/white?text=SpeechCraft+AI+🎤)

## ✨ Features

- **🎙️ Real-time Recording**: Record audio directly in your browser with live visualization
- **📁 File Upload**: Support for WAV, MP3, WebM, and OGG files (up to 25MB)
- **🤖 AI-Powered**: Uses OpenAI's Whisper model for industry-leading accuracy
- **💾 History**: Optional transcription history with Supabase integration
- **🎨 Beautiful UI**: Modern pink-themed interface with smooth animations
- **📱 Responsive**: Works perfectly on desktop and mobile devices
- **⚡ Fast**: Optimized for quick transcription and smooth user experience

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- OpenAI API key
- (Optional) Supabase account for history storage

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd speech-to-text-app
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**

   **Backend (.env in backend/ directory):**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # Required: OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional: Supabase Configuration (for history storage)
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_KEY=your_supabase_anon_key_here
   ```

   **Frontend (.env in root directory):**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start the application**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### OpenAI API Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to `backend/.env` as `OPENAI_API_KEY`
3. Ensure you have credits/billing set up in your OpenAI account

### Supabase Setup (Optional)

If you want transcription history storage:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create the following table in your database:

   ```sql
   CREATE TABLE transcriptions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     filename TEXT NOT NULL,
     transcription TEXT NOT NULL,
     user_id TEXT NOT NULL DEFAULT 'anonymous',
     audio_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. Create a storage bucket named `audio-files`:
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `audio-files`
   - Make it public for easier access

4. Add your Supabase URL and anon key to `backend/.env`

## 🎯 Usage

### Recording Audio
1. Click the "Record Audio" tab
2. Click "Start Recording" and allow microphone access
3. Speak clearly into your microphone
4. Click "Stop Recording" when done
5. Your transcription will appear automatically

### Uploading Files
1. Click the "Upload File" tab
2. Drag and drop an audio file or click to browse
3. Select a WAV, MP3, WebM, or OGG file (max 25MB)
4. Your transcription will appear automatically

### Managing Transcriptions
- **Copy**: Click the copy button to copy text to clipboard
- **Download**: Save transcriptions as text files
- **Share**: Use the native share API (mobile) or copy to clipboard
- **History**: View previous transcriptions (if Supabase is configured)

## 📁 Project Structure

```
speech-to-text-app/
├── src/
│   ├── components/
│   │   ├── AudioRecorder.jsx    # Voice recording component
│   │   ├── FileUpload.jsx       # File upload component
│   │   └── TranscriptionDisplay.jsx # Results display
│   ├── services/
│   │   └── api.js               # API integration
│   ├── App.jsx                  # Main application
│   └── main.jsx                 # Entry point
├── backend/
│   ├── config/
│   │   └── multerConfig.js      # File upload configuration
│   ├── routes/
│   │   └── transcribeRoutes.js  # API routes
│   ├── services/
│   │   ├── openaiService.js     # OpenAI integration
│   │   └── supabaseService.js   # Supabase integration
│   ├── uploads/                 # Temporary file storage
│   └── index.js                 # Express server
├── package.json                 # Frontend dependencies
└── README.md
```

## 🛠️ API Endpoints

### POST `/api/transcribe/upload`
Upload and transcribe an audio file
- **Body**: FormData with `audio` file and optional `userId`
- **Response**: Transcription result

### GET `/api/transcribe/history`
Get transcription history
- **Query**: `userId` (default: 'anonymous'), `limit` (default: 10)
- **Response**: Array of previous transcriptions

### GET `/api/transcribe/health`
Check backend service health
- **Response**: Service status

## 🎨 Customization

### Theming
The app uses a pink/rose color theme. To customize:

1. **Colors**: Edit Tailwind classes in components
2. **Gradients**: Modify gradient classes (e.g., `from-pink-500 to-rose-500`)
3. **Logo**: Replace the Sparkles icon in `App.jsx`

### Audio Settings
Modify recording settings in `AudioRecorder.jsx`:
- Sample rate, echo cancellation, noise suppression
- File format and quality settings
- Recording time limits

## 🔍 Troubleshooting

### Common Issues

**"Could not access microphone"**
- Check browser permissions for microphone access
- Ensure you're using HTTPS in production
- Try a different browser

**"Network error" or backend connection failed**
- Ensure backend server is running on port 5000
- Check firewall settings
- Verify environment variables are set correctly

**"OpenAI API quota exceeded"**
- Check your OpenAI account billing and usage
- Verify your API key is correct and active

**Transcription is inaccurate**
- Ensure clear audio quality
- Reduce background noise
- Try speaking more slowly and clearly

## 📝 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 💖 Acknowledgments

- **OpenAI** for the amazing Whisper API
- **Supabase** for backend infrastructure
- **Lucide React** for beautiful icons
- **Tailwind CSS** for styling utilities

---

Made with ❤️ using React, OpenAI Whisper & Supabase
