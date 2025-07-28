import { useState, useRef } from 'react';

const TranscribeAudio = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError(`Recording failed: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setProgress(0);
    
    try {
      const formData = new FormData();
      if (audioBlob) {
        formData.append('audio', audioBlob, 'recording.webm');
      } else if (selectedFile) {
        formData.append('audio', selectedFile);
      } else {
        throw new Error('No audio selected');
      }

      setProgress(20);
      const response = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST',
        body: formData
      });

      setProgress(60);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error');
      }

      setProgress(100);
      setTranscription(data.transcription);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Speech to Text Converter</h1>
      
      {/* File Upload */}
      <div className="mb-4">
        <label className="block mb-2">Upload Audio File</label>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          disabled={isRecording || isLoading}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Recording Controls */}
      <div className="mb-4">
        <label className="block mb-2">Or Record Audio</label>
        <div className="flex gap-2">
          <button
            onClick={startRecording}
            disabled={isRecording || isLoading}
            className={`px-4 py-2 rounded ${
              isRecording ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
            } text-white`}
          >
            {isRecording ? 'Recording...' : 'Start Recording'}
          </button>
          <button
            onClick={stopRecording}
            disabled={!isRecording || isLoading}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
          >
            Stop
          </button>
        </div>
      </div>

      {/* Audio Preview */}
      {audioBlob && (
        <div className="mb-4">
          <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={(!selectedFile && !audioBlob) || isLoading}
        className={`w-full py-2 px-4 rounded text-white ${
          isLoading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
        } mb-4`}
      >
        {isLoading ? 'Processing...' : 'Transcribe'}
      </button>

      {/* Progress Bar */}
      {isLoading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {/* Transcription Result */}
      {transcription && (
        <div className="p-4 bg-gray-50 rounded border">
          <h2 className="font-bold mb-2">Transcription:</h2>
          <p className="whitespace-pre-wrap">{transcription}</p>
        </div>
      )}
    </div>
  ); 
};

export default TranscribeAudio;