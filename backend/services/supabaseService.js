const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const storeTranscription = async (filename, transcription, userId = 'anonymous') => {
  try {
    const filePath = path.join(__dirname, '../../backend/uploads', filename);
    
    // Verify file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at: ${filePath}`);
    }

    // Upload to storage
    const fileData = fs.readFileSync(filePath);
    const { error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(`user-${userId}/${filename}`, fileData, {
        contentType: 'audio/*',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(`user-${userId}/${filename}`);

    // Store in database
    const { data, error } = await supabase
      .from('transcriptions')
      .insert({
        filename,
        transcription,
        user_id: userId,
        audio_url: publicUrl,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Clean up local file
    fs.unlinkSync(filePath);
    
    return {
      success: true,
      data: {
        id: data.id,
        transcription: data.transcription,
        audioUrl: data.audio_url,
        createdAt: data.created_at
      }
    };
  } catch (error) {
    console.error('❌ Supabase storage error:', error);
    throw error;
  }
};

const getTranscriptions = async (userId = 'anonymous', limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      data: data.map(item => ({
        id: item.id,
        transcription: item.transcription,
        audioUrl: item.audio_url,
        createdAt: item.created_at,
        filename: item.filename
      }))
    };
  } catch (error) {
    console.error('❌ Supabase fetch error:', error);
    throw error;
  }
};

module.exports = {
  storeTranscription,
  getTranscriptions
};