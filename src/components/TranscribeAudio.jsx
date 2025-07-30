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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setAudioBlob(null);
    setError('');
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

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError(`Microphone access error: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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

      const response = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const { transcription: result } = await response.json();
      setTranscription(result);
    } catch (err) {
      setError(err.message);
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
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedFile ? (
                <p className="text-pink-600">{selectedFile.name}</p>
              ) : (
                <p className="text-pink-500">
                  Click to select or drag & drop audio file
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
                } text-white font-medium transition-colors`}
              >
                {isRecording ? 'Recording...' : 'Start Recording'}
              </button>
              <button
                onClick={stopRecording}
                disabled={!isRecording || isLoading}
                className="py-2 px-4 bg-pink-400 hover:bg-pink-500 text-white rounded-lg font-medium transition-colors"
              >
                Stop
              </button>
            </div>
          </div>

          {/* Audio Preview */}
          {audioBlob && (
            <div className="mb-6">
              <audio 
                controls 
                src={URL.createObjectURL(audioBlob)} 
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
            } text-white font-medium text-lg transition-colors mb-6 shadow-md`}
          >
            {isLoading ? 'Processing...' : 'Transcribe Audio'}
          </button>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              <p>{error}</p>
            </div>
          )}

          {/* Transcription Result */}
          {transcription && (
            <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
              <h2 className="text-lg font-semibold text-pink-700 mb-2">
                Transcription:
              </h2>
              <div className="bg-white p-3 rounded">
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