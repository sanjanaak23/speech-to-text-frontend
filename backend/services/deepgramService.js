const { createClient } = require('@deepgram/sdk');
const fs = require('fs');

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const transcribeAudio = async (filePath) => {
  try {
    console.log('🎵 Starting transcription for:', filePath);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`);
    }

    // Read the audio file
    const audioBuffer = fs.readFileSync(filePath);

    // Configure transcription options
    const options = {
      model: 'nova-2',
      language: 'en',
      smart_format: true,
      punctuate: true,
      diarize: false,
      filler_words: false,
      summarize: false
    };

    console.log('🔄 Sending audio to Deepgram...');
    
    // Perform transcription
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      options
    );

    if (error) {
      throw new Error(`Deepgram API error: ${error.message}`);
    }

    if (!result?.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
      throw new Error('No transcription found in Deepgram response');
    }

    const transcript = result.results.channels[0].alternatives[0].transcript;
    const confidence = result.results.channels[0].alternatives[0].confidence;
    const duration = result.metadata?.duration;

    console.log('✅ Transcription completed');
    console.log(`📊 Confidence: ${(confidence * 100).toFixed(1)}%`);
    
    return {
      success: true,
      transcription: transcript,
      confidence: confidence,
      duration: duration
    };
  } catch (error) {
    console.error('❌ Deepgram transcription error:', error);
    
    if (error.message.includes('401')) {
      throw new Error('Invalid Deepgram API key. Please check your configuration.');
    } else if (error.message.includes('402')) {
      throw new Error('Deepgram API quota exceeded. Please check your billing.');
    } else if (error.message.includes('400')) {
      throw new Error('Invalid audio format. Please use WAV, MP3, WebM, or OGG.');
    }
    
    throw new Error(`Transcription failed: ${error.message}`);
  }
};

module.exports = {
  transcribeAudio
};