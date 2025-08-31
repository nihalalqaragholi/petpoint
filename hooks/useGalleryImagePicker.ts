import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useGalleryImagePicker() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function pickAndUploadImage(folder = 'products') {
    setError(null);
    console.log('[Picker] Requesting media permissions');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      const msg = 'Permission to access media library denied';
      console.log('[Picker] Permission denied');
      setError(msg);
      return null;
    }

    console.log('[Picker] Launching library');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.85,
      allowsEditing: false,
    });

    // Support new API (canceled + assets[]) and legacy (cancelled)
    const canceled = (result as any).canceled ?? (result as any).cancelled;
    if (canceled) {
      console.log('[Picker] User canceled');
      return null;
    }

    const asset = (result as any).assets?.[0] ?? result;
    const base64Str: string | undefined = asset.base64;
    const uri: string = asset.uri;
    const mimeType: string | undefined = asset.mimeType;

    if (!base64Str) {
      const msg = 'No base64 data returned by picker';
      console.log('[Picker] ERROR', msg, { uri, mimeType });
      setError(msg);
      return null;
    }

    try {
      setUploading(true);
      const mime = mimeType || inferMimeFromUri(uri);
      console.log('[Upload] Preparing blob', { mime, uriLen: uri?.length });
      const blob = await base64ToBlobAsync(base64Str, mime);

      const ext = extFromMimeOrUri(mime, uri);
      const fileName = `${folder}/${Date.now()}.${ext}`;
      console.log('[Upload] Start upload', { bucket: 'product-images', fileName, size: blob.size });

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, blob, { cacheControl: '3600', upsert: true, contentType: mime });

      if (uploadError) {
        console.log('[Upload] ERROR', uploadError);
        throw uploadError;
      }

      const { data: signed } = await supabase.storage
        .from('product-images')
        .createSignedUrl(fileName, 60 * 60 * 24 * 7);

      if (!signed?.signedUrl) throw new Error('Failed to get signed URL');

      console.log('[Upload] Success', { signedUrl: signed.signedUrl.slice(0, 60) + '...' });
      setImageUrl(signed.signedUrl);
      return signed.signedUrl;
    } catch (e: any) {
      console.log('[Upload] Exception', e?.message || e);
      setError(e?.message || 'Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  }

  function inferMimeFromUri(uri: string): string {
    const ext = uri.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png': return 'image/png';
      case 'webp': return 'image/webp';
      case 'gif': return 'image/gif';
      case 'heic': return 'image/heic';
      default: return 'image/jpeg';
    }
  }

  function extFromMimeOrUri(mime: string, uri: string): string {
    if (mime.includes('png')) return 'png';
    if (mime.includes('webp')) return 'webp';
    if (mime.includes('gif')) return 'gif';
    if (mime.includes('heic')) return 'heic';
    const fromUri = uri.split('.').pop()?.toLowerCase();
    return fromUri || 'jpg';
  }

  async function base64ToBlobAsync(base64: string, mime: string): Promise<Blob> {
    // Use data URL fetch to get a Blob consistently across RN/Web
    const res = await fetch(`data:${mime};base64,${base64}`);
    return await res.blob();
  }

  return [pickAndUploadImage, { uploading, error, imageUrl }] as const;
}