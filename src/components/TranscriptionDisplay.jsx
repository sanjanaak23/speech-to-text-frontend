import React, { useState } from 'react';
import { Copy, Download, Share2, CheckCircle, Clock, FileText } from 'lucide-react';

const TranscriptionDisplay = ({ transcription, isLoading, error, history = [] }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadTranscription = (text, filename = 'transcription.txt') => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareTranscription = async (text) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Audio Transcription',
          text: text,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        copyToClipboard(text);
      }
    } else {
      copyToClipboard(text);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 border border-yellow-200 shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Audio...</h3>
          <p className="text-gray-600">Our AI is transcribing your audio. This may take a few moments.</p>
          
          <div className="mt-6 bg-white rounded-xl p-4 border border-yellow-200">
            <div className="space-y-3">
              <div className="h-4 bg-yellow-100 rounded animate-pulse"></div>
              <div className="h-4 bg-yellow-100 rounded animate-pulse w-4/5"></div>
              <div className="h-4 bg-yellow-100 rounded animate-pulse w-3/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-2xl p-8 border border-red-200 shadow-lg">
        <div className="text-center">
          <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Transcription Failed</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600 text-sm">Please try again with a different audio file.</p>
        </div>
      </div>
    );
  }

  if (!transcription && history.length === 0) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 border border-yellow-200 shadow-lg">
        <div className="text-center">
          <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-4">
            <FileText className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Transcribe</h3>
          <p className="text-gray-600">Record audio or upload a file to get started with AI-powered transcription.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Transcription */}
      {transcription && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 border border-yellow-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <FileText className="w-6 h-6 text-yellow-600" />
              <span>Transcription Result</span>
            </h3>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Complete</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-yellow-200 mb-6">
            <div className="prose max-w-none">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {transcription}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => copyToClipboard(transcription)}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-4 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={() => downloadTranscription(transcription)}
              className="bg-white hover:bg-yellow-50 text-yellow-600 border border-yellow-300 px-4 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>

            <button
              onClick={() => shareTranscription(transcription)}
              className="bg-white hover:bg-yellow-50 text-yellow-600 border border-yellow-300 px-4 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 border border-yellow-200 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Clock className="w-6 h-6 text-yellow-600" />
            <span>Recent Transcriptions</span>
          </h3>

          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={item.id || index} className="bg-white rounded-xl p-4 border border-yellow-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-600">
                      {item.filename || `Recording ${index + 1}`}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                
                <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-3">
                  {item.transcription}
                </p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(item.transcription)}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                  
                  <button
                    onClick={() => downloadTranscription(item.transcription, `transcription-${index + 1}.txt`)}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptionDisplay;