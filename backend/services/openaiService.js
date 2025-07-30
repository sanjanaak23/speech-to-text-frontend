const OpenAI = require('openai');
const FormData = require('form-data');
const fs = require('fs');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const transcribeAudio = async (filePath) => {
  try {
    console.log('🎵 Starting transcription for:', filePath);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`);
    }

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      language: 'en', // Can be made configurable
      response_format: 'json',
      temperature: 0.2
    });

    console.log('✅ Transcription completed');
    return {
      success: true,
      transcription: transcription.text,
      duration: transcription.duration || null
    };
  } catch (error) {
    console.error('❌ OpenAI transcription error:', error);
    
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your billing.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your configuration.');
    } else if (error.code === 'model_not_found') {
      throw new Error('Whisper model not available. Please try again later.');
    }
    
    throw new Error(`Transcription failed: ${error.message}`);
  }
};

module.exports = {
  transcribeAudio
};