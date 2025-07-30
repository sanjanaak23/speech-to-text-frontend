import { useState, useRef } from 'react';

const TranscribeAudio = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  // Use environment variable with fallback for local development
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://speech-to-text-backend-i89r.onrender.com';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid audio file (WAV, MP3, WEBM, or OGG)');
        return;
      }
      
      // Validate file size (25MB max)
      if (file.size > 25 * 1024 * 1024) {
        setError('File size too large (max 25MB)');
        return;
      }

      setSelectedFile(file);
      setAudioBlob(null);
      setError('');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setSelectedFile(null);
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
    } catch (err) {
      setError(`Microphone access error: ${err.message}`);
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      if (audioBlob) {
        formData.append('audio', audioBlob, 'recording.webm');
      } else if (selectedFile) {
        formData.append('audio', selectedFile);
      } else {
        throw new Error('Please select or record audio first');
      }

      const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Transcription failed');
        } catch {
          throw new Error(errorText || 'Transcription failed');
        }
      }

      const result = await response.json();
      if (!result.transcription) {
        throw new Error('Received empty transcription');
      }

      setTranscription(result.transcription);
    } catch (err) {
      setError(err.message);
      console.error('API request failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6">
          <h1 className="text-2xl font-bold text-white text-center">
            Speech to Text Converter
          </h1>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-pink-700 mb-2">
              Upload Audio File
            </label>
            <div 
              className="border-2 border-dashed border-pink-300 rounded-lg p-4 text-center cursor-pointer hover:bg-pink-50 transition"
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".wav,.mp3,.webm,.ogg,audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedFile ? (
                <div>
                  <p className="text-pink-600 font-medium">{selectedFile.name}</p>
                  <p className="text-pink-500 text-sm">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <p className="text-pink-500">
                  Click to select or drag & drop audio file
                  <br />
                  <span className="text-xs">(Supports WAV, MP3, WEBM, OGG)</span>
                </p>
              )}
            </div>
          </div>

          {/* Recording Controls */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-pink-700 mb-2">
              Or Record Audio
            </label>
            <div className="flex gap-3">
              <button
                onClick={startRecording}
                disabled={isRecording || isLoading}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  isRecording ? 'bg-rose-400' : 'bg-pink-500 hover:bg-pink-600'
                } text-white font-medium transition-colors disabled:opacity-50`}
              >
                {isRecording ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                    Recording...
                  </span>
                ) : 'Start Recording'}
              </button>
              <button
                onClick={stopRecording}
                disabled={!isRecording || isLoading}
                className="py-2 px-4 bg-pink-400 hover:bg-pink-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Stop
              </button>
            </div>
          </div>

          {/* Audio Preview */}
          {(audioBlob || selectedFile) && (
            <div className="mb-6">
              <audio 
                controls 
                src={audioBlob ? URL.createObjectURL(audioBlob) : URL.createObjectURL(selectedFile)} 
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={(!selectedFile && !audioBlob) || isLoading}
            className={`w-full py-3 px-4 rounded-lg ${
              isLoading ? 'bg-pink-300' : 'bg-pink-500 hover:bg-pink-600'
            } text-white font-medium text-lg transition-colors mb-6 shadow-md disabled:opacity-50`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Transcribe Audio'}
          </button>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Transcription Result */}
          {transcription && (
            <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-pink-700">Transcription:</h2>
                <button 
                  onClick={() => navigator.clipboard.writeText(transcription)}
                  className="text-pink-500 hover:text-pink-700 text-sm font-medium"
                >
                  Copy Text
                </button>
              </div>
              <div className="bg-white p-3 rounded max-h-60 overflow-y-auto">
                <p className="whitespace-pre-wrap">{transcription}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscribeAudio;