const { createClient } = require('@deepgram/sdk');

// Test Deepgram connectivity
async function testDeepgram() {
  console.log('🧪 Testing Deepgram API...');
  
  const DEEPGRAM_API_KEY = 'f0b8a2389747e94a857ed5aed5476e8f0076290a';
  console.log('🔑 Using API key:', DEEPGRAM_API_KEY.substring(0, 10) + '...');
  
  const deepgram = createClient(DEEPGRAM_API_KEY);
  
  try {
    // Test with a small audio buffer (silence)
    const silenceBuffer = Buffer.alloc(44100 * 2); // 1 second of silence at 44.1kHz, 16-bit
    
    console.log('📡 Sending test audio to Deepgram...');
    
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      silenceBuffer,
      {
        model: 'nova-2',
        language: 'en'
      }
    );
    
    if (error) {
      console.error('❌ Deepgram API error:', error);
      return;
    }
    
    console.log('✅ Deepgram API is working!');
    console.log('📋 Response structure:', {
      hasResults: !!result.results,
      hasChannels: !!result.results?.channels,
      channelCount: result.results?.channels?.length || 0
    });
    
    if (result.results?.channels?.[0]?.alternatives?.[0]) {
      const transcript = result.results.channels[0].alternatives[0].transcript;
      console.log('📝 Transcript (should be empty for silence):', transcript);
    }
    
  } catch (err) {
    console.error('💥 Test failed:', err.message);
    console.error('📋 Full error:', err);
  }
}

testDeepgram();