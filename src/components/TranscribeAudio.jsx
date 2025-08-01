import { useState, useRef, useEffect } from 'react';
import './TranscribeAudio.css';
import backgroundImage from '../assets/background.jpg';

const TranscribeAudio = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid audio file (WAV, MP3, WEBM, or OGG)');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File size too large (max 25MB)');
      return;
    }

    setSelectedFile(file);
    setAudioBlob(null);
    setAudioUrl('');
    setError('');
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
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
        setAudioUrl(URL.createObjectURL(blob));
        setSelectedFile(null);
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
    } catch (err) {
      setError(`Microphone access error: ${err.message}`);
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
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

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transcribe`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const { transcription: result } = await response.json();
      setTranscription(result);
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="content-card">
        <h1 className="main-title">Speech to Text Converter</h1>
        
        <div className="upload-section">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".wav,.mp3,.webm,.ogg,audio/*"
            className="file-input"
          />
          <button 
            className="upload-btn"
            onClick={triggerFileInput}
            disabled={isRecording || isLoading}
          >
            {selectedFile ? `Selected: ${selectedFile.name}` : 'Select Audio File'}
          </button>
          
          {selectedFile && (
            <div className="file-info">
              <p>Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              <button 
                className="clear-btn"
                onClick={() => {
                  setSelectedFile(null);
                  setError('');
                }}
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        <div className="recording-section">
          {!isRecording ? (
            <button 
              className="record-btn"
              onClick={startRecording}
              disabled={!!selectedFile || isLoading}
            >
              Start Recording
            </button>
          ) : (
            <button className="stop-btn" onClick={stopRecording}>
              Stop Recording
            </button>
          )}
          {isRecording && (
            <div className="recording-status">
              <span className="recording-dot"></span>
              Recording...
            </div>
          )}
        </div>

        {(audioUrl || selectedFile) && (
          <div className="audio-preview">
            <audio 
              controls 
              src={audioUrl || URL.createObjectURL(selectedFile)} 
            />
          </div>
        )}

        <button 
          className="submit-btn"
          onClick={handleSubmit}
          disabled={(!selectedFile && !audioBlob) || isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : (
            'Transcribe Audio'
          )}
        </button>

        {error && <div className="error-message">{error}</div>}

        {transcription && (
          <div className="transcription-result">
            <h2>Transcription:</h2>
            <div className="transcription-text">{transcription}</div>
            <button 
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(transcription);
              }}
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscribeAudio;