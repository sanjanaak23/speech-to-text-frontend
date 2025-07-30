require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Validate required environment variables
if (!process.env.DEEPGRAM_API_KEY) {
  console.error('❌ ERROR: Deepgram API key is required!');
  console.error('📝 Please add your Deepgram API key to backend/.env file');
  console.error('💡 Get your API key from: https://console.deepgram.com/');
  console.error('');
  console.error('Example .env file:');
  console.error('DEEPGRAM_API_KEY=your-actual-api-key-here');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173',
    'https://speech-to-text-frontend-6frv8fbxs.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/transcribe', require('./routes/transcribeRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SpeechCraft AI backend is running',
    timestamp: new Date().toISOString(),
    deepgram: !!process.env.DEEPGRAM_API_KEY,
    supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_KEY)
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🎤 SpeechCraft AI Backend');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`✅ Deepgram API: ${process.env.DEEPGRAM_API_KEY ? 'Configured' : 'Missing'}`);
  console.log(`${process.env.SUPABASE_URL ? '✅' : '⚠️ '} Supabase: ${process.env.SUPABASE_URL ? 'Configured' : 'Not configured (optional)'}`);
  console.log('');
});