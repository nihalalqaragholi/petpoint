import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
// remove manipulator import to avoid web bundling issues
import { supabase } from '@/lib/supabase';
import { Buffer } from 'buffer';
import { Alert, Platform } from 'react-native';

export function usePickAndUploadImage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const showAlert = (title: string, msg: string) => {
    if (Platform.OS === 'web') {
      const win: any = (globalThis as any);
      if (win && typeof win.alert === 'function') {
        win.alert(`${title}\n\n${msg}`);
      } else {
        console.warn(`${title}: ${msg}`);
      }
      return;
    }
    Alert.alert(title, msg);
  };
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const raceWithTimeout = async <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)) as Promise<T>,
    ]);
  };

  const pickWebFile = async (): Promise<{ file: File; name: string; ext: string }> => {
    return new Promise((resolve, reject) => {
      try {
        const doc: any = (globalThis as any)?.document;
        if (!doc) return reject(new Error('Document not available in this environment.'));
        const input = doc.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        const timer = setTimeout(() => reject(new Error('File picker did not open. It may be blocked by the browser.')), 12000);
        input.onchange = () => {
          clearTimeout(timer);
          const f = input.files?.[0];
          if (!f) return reject(new Error('No file selected'));
          const name = f.name || `image_${Date.now()}`;
          const ext = (name.split('.').pop() || 'jpg').toLowerCase();
          resolve({ file: f, name, ext });
        };
        input.click();
      } catch (e: any) {
        reject(new Error(e?.message || 'Unable to open file picker'));
      }
    });
  };

  async function launchPickerWithWorkarounds(): Promise<any> {
    // iOS sometimes needs a slight delay before presenting controllers
    await wait(150);
    const mediaTypes = (ImagePicker as any).MediaType?.Images ?? ImagePicker.MediaTypeOptions.Images;
    try {
      return await raceWithTimeout(
        ImagePicker.launchImageLibraryAsync({ mediaTypes, allowsEditing: true, quality: 0.7, base64: true, allowsMultipleSelection: false, presentationStyle: 'fullScreen' as any }),
        20000,
        'File picker'
      );
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (Platform.OS === 'ios' && msg.includes('Cannot determine currently presented view controller')) {
        console.log('[Upload] iOS controller error, retrying once after delay...');
        await wait(350);
        return await raceWithTimeout(
          ImagePicker.launchImageLibraryAsync({ mediaTypes, allowsEditing: true, quality: 0.7, base64: true, allowsMultipleSelection: false, presentationStyle: 'fullScreen' as any }),
          20000,
          'File picker retry'
        );
      }
      throw e;
    }
  }
  const doPickAndUpload = async (adminId: string) => {
    console.log('[Upload] Start');
    const sessionRes = await supabase.auth.getSession();
    console.log('Current session info:', sessionRes);

    // 1) Pick image
    let assetUri: string | undefined;
    let webFile: File | undefined;
    let assetBase64: string | undefined;
    let ext = 'jpg';
    console.log('[Upload] Platform:', Platform.OS);
    if (Platform.OS === 'web') {
      console.log('[Upload] Using web file input');
      const picked = await pickWebFile().catch((e) => {
        showAlert('File picker error', e?.message || 'Unable to open file picker in this environment.');
        throw e;
      });
      webFile = picked.file;
      ext = picked.ext;
    } else {
      // Request permissions first
      const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!req.granted) {
          showAlert('Permission needed', 'Please allow Photos access in Settings to pick an image.');
          return null;
        }
      }
      console.log('[Upload] Opening native picker...');
      const pickerRes: any = await launchPickerWithWorkarounds();
      console.log('[Upload] Picker result:', pickerRes);
      const canceled = pickerRes?.canceled ?? pickerRes?.cancelled;
      if (canceled) {
        console.log('[Upload] User canceled');
        return null;
      }
      const asset = pickerRes?.assets?.[0] ?? pickerRes;
      assetUri = asset?.uri;
      assetBase64 = asset?.base64;
      if (!assetUri) throw new Error('No image selected');
      const fromUriExt = (assetUri.split('.').pop() || '').toLowerCase();
      // Map known extensions; default to jpg if unknown
      ext = ['jpg','jpeg','png','webp','heic','heif'].includes(fromUriExt) ? fromUriExt : 'jpg';
    }

    const fileName = `admin_${adminId}_${Date.now()}.${ext}`;
    console.log('[Upload] Preparing upload for', fileName);

    // 2) Prepare binary and contentType
    let uploadBody: Blob | ArrayBuffer | File;
    let contentType: string;
    if (Platform.OS === 'web' && (webFile as any) instanceof File) {
      uploadBody = webFile as any;
      contentType = (webFile as any).type || (ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : (ext === 'heic' || ext==='heif') ? 'image/heic' : 'image/jpeg');
    } else {
      // Native: use base64 from picker to avoid iCloud/HEIC read hangs
      if (!assetBase64) {
        throw new Error('No base64 data from picker.');
      }
      console.log('[Upload] Using base64 from picker, length:', assetBase64.length);
      const uint8 = Buffer.from(assetBase64, 'base64');
      contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : (ext === 'heic' || ext==='heif') ? 'image/heic' : 'image/jpeg';
      // Always pass ArrayBuffer on native to avoid Blob transport issues
      uploadBody = uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength);
      console.log('[Upload] Prepared ArrayBuffer length:', uint8.byteLength);
    }
    console.log('[Upload] Payload ready. Kind:', Platform.OS === 'web' ? (uploadBody instanceof File ? 'File' : uploadBody instanceof Blob ? 'Blob' : typeof uploadBody) : (uploadBody instanceof Blob ? 'Blob' : 'ArrayBuffer'), 'contentType:', contentType);

    // 3) Upload to Supabase Storage
    const BUCKET = 'product-images';
    console.log('[Upload] Uploading to bucket:', BUCKET, 'contentType:', contentType);
    const { data, error: upErr } = await raceWithTimeout(
      supabase.storage.from(BUCKET).upload(fileName, uploadBody as any, {
        cacheControl: '3600',
        upsert: false,
        contentType,
      }),
      30000,
      'Uploading to storage'
    );
    if (upErr) {
      console.log('[Upload] Storage upload error:', upErr);
      const msg = (upErr as any)?.message || '';
      if (msg.includes('Not Found')) {
        showAlert('Storage bucket missing', `Bucket "${BUCKET}" not found. Please create it in Supabase Storage.`);
      } else if ((upErr as any)?.status === 401 || (upErr as any)?.status === 403) {
        showAlert('Permission denied', 'Your account is not allowed to upload to this bucket. Please update Supabase storage policies.');
      } else if ((upErr as any)?.status === 413) {
        showAlert('File too large', 'Selected image is too large. Try picking a smaller image or reduce quality.');
      }
      throw upErr;
    }
    console.log('[Upload] Uploaded path:', data?.path);

    // 4) Get signed URL
    const { data: urlData, error: urlErr } = await raceWithTimeout(
      supabase.storage.from(BUCKET).createSignedUrl(data!.path, 60 * 60 * 24 * 7),
      12000,
      'Creating signed URL'
    );
    if (urlErr) {
      console.log('[Upload] Signed URL error:', urlErr);
      throw urlErr;
    }
    console.log('[Upload] Success URL:', urlData.signedUrl);
    return urlData.signedUrl as string;
  };

  // Call this to pick and upload
  const uploadImage = async (adminId: string) => {
    setError('');
    setImageUrl('');
    setUploading(true);
    try {
      const url = await doPickAndUpload(adminId);
      if (url) {
        setImageUrl(url);
        showAlert('Image uploaded', 'Your image has been uploaded successfully.');
      }
      return url;
    } catch (err: any) {
      console.log('[Upload] Error caught:', err);
      const msg = err?.message || 'Unknown error';
      setError(msg);
      showAlert('Upload failed', msg);
    } finally {
      setUploading(false);
    }
  };

  return [uploadImage, { uploading, error, imageUrl }] as const;
}

// Named helper used by MyPetForm without React state
export async function pickAndUploadImage(): Promise<string | null> {
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  try {
    // pick
    let body: any;
    let contentType = 'image/jpeg';
    let pathExt = 'jpg';
    if (Platform.OS === 'web') {
      const doc: any = (globalThis as any)?.document;
      if (!doc) throw new Error('No document');
      const input = doc.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      const picked: any = await new Promise((resolve, reject) => {
        input.onchange = () => {
          const f = input.files?.[0];
          if (!f) return reject(new Error('No file selected'));
          resolve(f);
        };
        input.click();
      });
      body = picked;
      const name = picked.name || `image_${Date.now()}`;
      pathExt = (name.split('.').pop() || 'jpg').toLowerCase();
      contentType = picked.type || (pathExt === 'png' ? 'image/png' : pathExt === 'webp' ? 'image/webp' : (pathExt === 'heic' || pathExt==='heif') ? 'image/heic' : 'image/jpeg');
    } else {
      const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!req.granted) return null;
      }
      await wait(150);
      const mediaTypes = (ImagePicker as any).MediaType?.Images ?? ImagePicker.MediaTypeOptions.Images;
      let res: any;
      try {
        res = await ImagePicker.launchImageLibraryAsync({ mediaTypes, quality: 0.7, base64: true, allowsEditing: true, presentationStyle: 'fullScreen' as any });
      } catch (e: any) {
        if (Platform.OS === 'ios' && String(e?.message || e).includes('Cannot determine currently presented view controller')) {
          await wait(350);
          res = await ImagePicker.launchImageLibraryAsync({ mediaTypes, quality: 0.7, base64: true, allowsEditing: true, presentationStyle: 'fullScreen' as any });
        } else {
          throw e;
        }
      }
      if (res?.canceled ?? res?.cancelled) return null;
      const asset = (res.assets?.[0] ?? res) as any;
      const b64: string | undefined = asset?.base64;
      const uri: string | undefined = asset?.uri;
      if (!b64) throw new Error('No base64 data from picker.');
      const fromUriExt = (uri?.split('.').pop() || '').toLowerCase();
      pathExt = ['jpg','jpeg','png','webp','heic','heif'].includes(fromUriExt) ? fromUriExt : 'jpg';
      contentType = pathExt === 'png' ? 'image/png' : pathExt === 'webp' ? 'image/webp' : (pathExt === 'heic' || pathExt==='heif') ? 'image/heic' : 'image/jpeg';
      // Always ArrayBuffer on native
      body = Buffer.from(b64, 'base64').buffer;
    }

    const fileName = `public_${Date.now()}.${pathExt}`;
    const BUCKET = 'pet-images';
    const { data, error } = await supabase.storage.from(BUCKET).upload(fileName, body, { contentType, cacheControl: '3600', upsert: false });
    if (error) throw error;
    // pet-images is public; build a public URL
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(data!.path);
    return pub.publicUrl as string;
  } catch (e) {
    console.error('pickAndUploadImage failed:', e);
    return null;
  }
}