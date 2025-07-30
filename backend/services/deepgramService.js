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

    console.log('🔄 Sending audio to Deepgram...');
    console.log('📁 File size:', audioBuffer.length, 'bytes');
    
    // Perform transcription using correct Deepgram v3 API
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        language: 'en',
        smart_format: true,
        punctuate: true
      }
    );

    console.log('📋 Raw Deepgram response received');

    if (error) {
      console.error('❌ Deepgram API error:', error);
      throw new Error(`Deepgram API error: ${JSON.stringify(error)}`);
    }

    if (!result) {
      console.error('❌ No result from Deepgram');
      throw new Error('No result received from Deepgram API');
    }

    console.log('📋 Result structure:', {
      hasResults: !!result.results,
      hasChannels: !!result.results?.channels,
      channelCount: result.results?.channels?.length || 0,
      hasAlternatives: !!result.results?.channels?.[0]?.alternatives,
      alternativeCount: result.results?.channels?.[0]?.alternatives?.length || 0
    });

    if (!result.results?.channels?.[0]?.alternatives?.[0]) {
      console.error('❌ Invalid response structure:', JSON.stringify(result, null, 2));
      throw new Error('Invalid response structure from Deepgram');
    }

    const alternative = result.results.channels[0].alternatives[0];
    const transcript = alternative.transcript;
    const confidence = alternative.confidence;
    const duration = result.metadata?.duration;

    if (!transcript || transcript.trim() === '') {
      throw new Error('Empty transcription result - audio may be silent or unclear');
    }

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