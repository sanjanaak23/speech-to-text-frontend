import React, { useState, useEffect } from 'react';
import AudioRecorder from './components/AudioRecorder';
import FileUpload from './components/FileUpload';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import { transcriptionAPI, audioUtils } from './services/api';
import { Sparkles, Heart, Github } from 'lucide-react';
import backgroundImage from './assets/background.jpg';

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
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${backgroundImage}), linear-gradient(-45deg, #fbbf24, #f59e0b, #d97706, #92400e)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Animated overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-amber-800/10 to-white/30 animate-pulse"></div>
      
      {/* Floating animation elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300/20 rounded-full animate-bounce delay-100"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-amber-400/20 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-yellow-200/20 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-20 right-40 w-12 h-12 bg-amber-300/20 rounded-full animate-bounce delay-700"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-200"></div>
        <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-amber-500 rounded-full animate-ping delay-400"></div>
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-yellow-500 rounded-full animate-ping delay-600"></div>
      </div>
      
      <div className="relative z-10">
              {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-yellow-200 sticky top-0 z-50 animate-slide-down">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 animate-fade-in">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl transform hover:scale-110 transition-all duration-300 animate-pulse hover:animate-none">
                  <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
                </div>
                <div className="transform hover:scale-105 transition-all duration-300">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent animate-gradient">
                    VoiceScribe
                  </h1>
                  <p className="text-sm text-gray-600 animate-fade-in delay-300">Speech to Text Converter</p>
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
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 animate-bounce-in">
            Convert Speech to Text Easily ✨
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in delay-200 transform hover:scale-105 transition-all duration-300">
            Upload audio files or record directly in your browser. Get accurate transcriptions
            in seconds with our simple speech-to-text service.
          </p>
        </div>

        {/* Input Section - Both Recording and Upload */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6 animate-slide-in-left">
            <div className="transform hover:scale-105 transition-all duration-300">
              <AudioRecorder
                onAudioRecorded={handleAudioRecorded}
                isLoading={isLoading}
              />
            </div>
            <div className="transform hover:scale-105 transition-all duration-300 animate-fade-in delay-300">
              <FileUpload
                onFileSelected={handleFileSelected}
                isLoading={isLoading}
                disabled={!isConnected}
              />
            </div>
          </div>

          <div className="animate-slide-in-right">
            <div className="transform hover:scale-105 transition-all duration-300">
              <TranscriptionDisplay
                transcription={transcription}
                isLoading={isLoading}
                error={error}
                history={history}
              />
            </div>
          </div>
        </div>

      </main>
      </div>
    </div>
  );
}

export default App;