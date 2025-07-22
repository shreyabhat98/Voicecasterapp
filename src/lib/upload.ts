
import { supabase } from './supabase';

export async function uploadToSupabase(file: Blob, fileName: string): Promise<string | null> {
  const { data, error } = await supabase
    .storage
    .from('voice-recordings')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error',error.message, error);
    return null;
  }

  // ✅ Get public URL after upload
  const { data: publicData } = supabase
    .storage
    .from('voice-recordings')
    .getPublicUrl(fileName);

  const publicUrl = publicData?.publicUrl;

  if (!publicUrl) {
    console.error('Failed to get public URL');
    return null;
  }

  return publicUrl;
}
