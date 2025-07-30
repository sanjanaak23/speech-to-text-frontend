const express = require('express');
const upload = require('../config/multerConfig');
const { transcribeAudio } = require('../services/openaiService');
const { storeTranscription, getTranscriptions } = require('../services/supabaseService');
const path = require('path');

const router = express.Router();

// Upload and transcribe audio file
router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }

    console.log('📁 File uploaded:', req.file.filename);
    const filePath = req.file.path;

    // Transcribe with OpenAI
    const transcriptionResult = await transcribeAudio(filePath);
    
    if (!transcriptionResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Transcription failed'
      });
    }

    // Store in Supabase (optional, based on environment)
    let storedData = null;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      try {
        const storeResult = await storeTranscription(
          req.file.filename,
          transcriptionResult.transcription,
          req.body.userId || 'anonymous'
        );
        storedData = storeResult.data;
      } catch (storeError) {
        console.warn('⚠️ Failed to store in Supabase:', storeError.message);
        // Continue without failing the request
      }
    }

    res.json({
      success: true,
      data: {
        transcription: transcriptionResult.transcription,
        duration: transcriptionResult.duration,
        filename: req.file.filename,
        stored: storedData
      }
    });

  } catch (error) {
    console.error('❌ Transcription route error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get transcription history
router.get('/history', async (req, res) => {
  try {
    const userId = req.query.userId || 'anonymous';
    const limit = parseInt(req.query.limit) || 10;

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      return res.json({
        success: true,
        data: [],
        message: 'History feature requires Supabase configuration'
      });
    }

    const result = await getTranscriptions(userId, limit);
    res.json(result);

  } catch (error) {
    console.error('❌ History route error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Transcription service is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;