import React, { useState, useEffect } from 'react';
import AudioRecorder from './components/AudioRecorder';
import FileUpload from './components/FileUpload';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import { transcriptionAPI, audioUtils } from './services/api';
import { Sparkles, Heart, Github } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Check backend health on component mount
  useEffect(() => {
    checkBackendHealth();
    loadHistory();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const result = await transcriptionAPI.checkHealth();
      setIsConnected(result.success);
    } catch (err) {
      setIsConnected(false);
      console.warn('Backend health check failed:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const result = await transcriptionAPI.getHistory();
      if (result.success) {
        setHistory(result.data);
      }
    } catch (err) {
      console.warn('Failed to load history:', err);
    }
  };

  const handleAudioRecorded = async (audioBlob) => {
    await processAudio(audioBlob);
  };

  const handleFileSelected = async (file) => {
    if (!file) return;
    
    try {
      audioUtils.validateAudioFile(file);
      await processAudio(file);
    } catch (err) {
      setError(err.message);
    }
  };

  const processAudio = async (audioFile) => {
    setIsLoading(true);
    setError('');
    setTranscription('');

    try {
      console.log('🎵 Processing audio file:', audioFile);
      
      const result = await transcriptionAPI.uploadAudio(audioFile);
      
      if (result.success && result.data) {
        setTranscription(result.data.transcription);
        
        // Refresh history to include new transcription
        setTimeout(() => {
          loadHistory();
        }, 1000);
        
        console.log('✅ Transcription completed successfully');
      } else {
        throw new Error('Failed to get transcription from server');
      }
    } catch (err) {
      console.error('❌ Transcription error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setTranscription('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-amber-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-yellow-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  SpeechCraft AI
                </h1>
                <p className="text-sm text-gray-600">Powered by OpenAI Whisper</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>{isConnected ? 'Connected' : 'Offline'}</span>
              </div>
              
              {/* GitHub Link */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-yellow-100 rounded-full transition-colors duration-200"
              >
                <Github className="w-5 h-5 text-gray-600" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Transform Speech into Text with AI ✨
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload audio files or record directly in your browser. Our AI-powered transcription
            service delivers accurate results in seconds.
          </p>
        </div>

        {/* Input Section - Both Recording and Upload */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <AudioRecorder
              onAudioRecorded={handleAudioRecorded}
              isLoading={isLoading}
            />
            <FileUpload
              onFileSelected={handleFileSelected}
              isLoading={isLoading}
              disabled={!isConnected}
            />
          </div>

          <div>
            <TranscriptionDisplay
              transcription={transcription}
              isLoading={isLoading}
              error={error}
              history={history}
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl p-8 border border-yellow-200 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">
            Why Choose SpeechCraft AI?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 bg-yellow-100 rounded-full w-fit mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-yellow-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered Accuracy</h4>
              <p className="text-gray-600">
                Powered by OpenAI's Whisper model for industry-leading transcription accuracy
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-yellow-100 rounded-full w-fit mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-yellow-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Real-time Recording</h4>
              <p className="text-gray-600">
                Record directly in your browser with live audio visualization and instant processing
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-yellow-100 rounded-full w-fit mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-yellow-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Multiple Formats</h4>
              <p className="text-gray-600">
                Support for WAV, MP3, WebM, and OGG audio formats up to 25MB
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-yellow-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-gray-600">Made with</span>
              <Heart className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-gray-600">using React, OpenAI Whisper & Supabase</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 SpeechCraft AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;