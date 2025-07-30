import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';

const FileUpload = ({ onFileSelected, isLoading, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (disabled) return;
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid audio file (WAV, MP3, WebM, or OGG)');
      return;
    }

    // Validate file size (25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      alert('File size must be less than 25MB');
      return;
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    onFileSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 border border-yellow-200 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">📁 File Upload</h3>
        <p className="text-gray-600">Upload an audio file to transcribe</p>
      </div>

      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
            dragActive
              ? 'border-yellow-500 bg-yellow-100'
              : disabled
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full ${
              dragActive ? 'bg-yellow-200' : 'bg-yellow-100'
            }`}>
              <Upload className={`w-8 h-8 ${
                disabled ? 'text-gray-400' : dragActive ? 'text-yellow-600' : 'text-yellow-500'
              }`} />
            </div>
            
            <div>
              <p className={`text-lg font-semibold mb-2 ${
                disabled ? 'text-gray-400' : 'text-gray-700'
              }`}>
                {dragActive ? 'Drop your audio file here' : 'Drop audio file here or click to browse'}
              </p>
              <p className={`text-sm ${
                disabled ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Supports WAV, MP3, WebM, OGG (max 25MB)
              </p>
            </div>
            
            {!disabled && (
              <button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-6 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
                Choose File
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <File className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isLoading && (
                <div className="p-1 bg-green-100 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              )}
              
              {!disabled && (
                <button
                  onClick={removeFile}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
          </div>
          
          {isLoading && (
            <div className="mt-4 flex items-center space-x-2 text-yellow-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <span className="text-sm">Processing file...</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>✨ Powered by OpenAI Whisper for accurate transcription</p>
      </div>
    </div>
  );
};

export default FileUpload;