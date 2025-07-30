const { createClient } = require('@deepgram/sdk');
const fs = require('fs');

// Initialize Deepgram client with explicit API key
const DEEPGRAM_API_KEY = 'f0b8a2389747e94a857ed5aed5476e8f0076290a';
const deepgram = createClient(DEEPGRAM_API_KEY);

console.log('🔑 Deepgram client initialized with API key:', DEEPGRAM_API_KEY.substring(0, 10) + '...');

const transcribeAudio = async (filePath) => {
  try {
    console.log('🎵 Starting transcription for:', filePath);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`);
    }

    // Get file extension to determine format
    const fileExtension = filePath.split('.').pop().toLowerCase();
    console.log('📁 File extension:', fileExtension);

    // Read the audio file
    const audioBuffer = fs.readFileSync(filePath);

    console.log('🔄 Sending audio to Deepgram...');
    console.log('📁 File size:', audioBuffer.length, 'bytes');
    
    // Determine MIME type based on file extension
    let mimeType = 'audio/wav'; // default
    switch (fileExtension) {
      case 'mp3':
        mimeType = 'audio/mpeg';
        break;
      case 'wav':
        mimeType = 'audio/wav';
        break;
      case 'webm':
        mimeType = 'audio/webm';
        break;
      case 'ogg':
        mimeType = 'audio/ogg';
        break;
      case 'm4a':
        mimeType = 'audio/mp4';
        break;
    }
    
    console.log('🎵 Detected MIME type:', mimeType);
    
    // Perform transcription using correct Deepgram v3 API
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        language: 'en',
        smart_format: true,
        punctuate: true,
        mimetype: mimeType
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
    
    // Handle specific Deepgram errors
    if (error.__dgError) {
      if (error.status === 401) {
        throw new Error('Invalid Deepgram API key. Please check your configuration.');
      } else if (error.status === 402) {
        throw new Error('Deepgram API quota exceeded. Please check your billing.');
      } else if (error.status === 400) {
        if (error.message.includes('corrupt or unsupported data')) {
          throw new Error('Audio file format not supported or corrupted. Please try a different file.');
        }
        throw new Error('Bad request to Deepgram API. Please check your audio file format.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
    }
    
    // Generic error handling
    const errorMessage = error.message || error.toString();
    console.error('📋 Full error details:', error);
    
    throw new Error(`Transcription failed: ${errorMessage}`);
  }
};

module.exports = {
  transcribeAudio
};