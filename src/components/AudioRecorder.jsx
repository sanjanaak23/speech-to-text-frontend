import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw } from 'lucide-react';

const AudioRecorder = ({ onAudioRecorded, isLoading }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Audio level monitoring
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(average / 255);
    
    if (isRecording) {
      animationRef.current = requestAnimationFrame(monitorAudioLevel);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100 
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio analysis
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onAudioRecorded(audioBlob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start audio level monitoring
      monitorAudioLevel();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      setAudioLevel(0);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const resetRecording = () => {
    setAudioURL(null);
    setRecordingTime(0);
    setIsPlaying(false);
    setAudioLevel(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 border border-pink-200 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">🎤 Voice Recorder</h3>
        <p className="text-gray-600">Record your voice and convert it to text instantly</p>
      </div>

      {/* Audio Level Visualizer */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          {/* Outer ring */}
          <div className={`w-32 h-32 rounded-full border-4 transition-all duration-300 ${
            isRecording 
              ? 'border-pink-400 animate-pulse' 
              : 'border-pink-200'
          }`}>
            {/* Inner circle with audio level */}
            <div 
              className={`w-full h-full rounded-full transition-all duration-100 flex items-center justify-center ${
                isRecording ? 'bg-pink-400' : 'bg-pink-100'
              }`}
              style={{
                transform: `scale(${0.8 + (audioLevel * 0.3)})`,
                opacity: isRecording ? 0.8 + (audioLevel * 0.2) : 1
              }}
            >
              <Mic className={`w-8 h-8 ${isRecording ? 'text-white' : 'text-pink-500'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Recording Time */}
      {(isRecording || recordingTime > 0) && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 border border-pink-200">
            {isRecording && (
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
            <span className="text-lg font-mono font-semibold text-gray-700">
              {formatTime(recordingTime)}
            </span>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isLoading}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center space-x-2"
          >
            <Mic className="w-5 h-5" />
            <span>Start Recording</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
          >
            <Square className="w-5 h-5" />
            <span>Stop Recording</span>
          </button>
        )}

        {audioURL && !isRecording && (
          <button
            onClick={resetRecording}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Audio Playback */}
      {audioURL && (
        <div className="bg-white rounded-xl p-4 border border-pink-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">🎵 Recording Preview</span>
            <button
              onClick={togglePlayback}
              className="bg-pink-100 hover:bg-pink-200 text-pink-600 p-2 rounded-full transition-all duration-200"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          </div>
          <audio
            ref={audioRef}
            src={audioURL}
            onEnded={() => setIsPlaying(false)}
            className="w-full mt-2"
            controls
          />
        </div>
      )}

      {isLoading && (
        <div className="text-center mt-4">
          <div className="inline-flex items-center space-x-2 text-pink-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
            <span>Processing audio...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;