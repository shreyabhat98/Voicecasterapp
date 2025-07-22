import { supabase } from './supabase';

export async function uploadToSupabase(file: Blob, fileName: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('voice-recordings')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Upload error', error);
    return null;
  }

  const { data: publicUrlData } = supabase
    .storage
    .from('voice-recordings')
    .getPublicUrl(fileName);

  return publicUrlData?.publicUrl || null;
}
