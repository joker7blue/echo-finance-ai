import { SupabaseClient } from "@supabase/supabase-js";

export class StorageService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Upload audio file to Supabase Storage
   */
  async uploadAudio(userId: string, file: File | Blob, filename: string) {
    const filepath = `${userId}/${filename}`;

    const { data, error } = await this.supabase.storage
      .from("voice-recordings")
      .upload(filepath, file, {
        contentType: file.type || "audio/webm",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL (note: bucket is private, so this returns a signed URL)
    const { data: urlData } = this.supabase.storage
      .from("voice-recordings")
      .getPublicUrl(filepath);

    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  }

  /**
   * Get signed URL for audio file (valid for 1 hour)
   */
  async getSignedUrl(filepath: string) {
    const { data, error } = await this.supabase.storage
      .from("voice-recordings")
      .createSignedUrl(filepath, 3600); // 1 hour

    if (error) throw error;
    return data.signedUrl;
  }

  /**
   * Delete audio file
   */
  async deleteAudio(filepath: string) {
    const { error } = await this.supabase.storage
      .from("voice-recordings")
      .remove([filepath]);

    if (error) throw error;
  }
}
