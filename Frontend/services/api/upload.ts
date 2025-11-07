import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface GenerateImageResponse {
  image_base64: string;
  content_type: string; // e.g., image/png
}

export async function generateCareerImage(params: {
  uri: string;
  filename?: string;
  mimeType?: string;
  name?: string; // child name (optional)
  dreamJob: string;
}): Promise<string> {
  const token = await SecureStore.getItemAsync('auth_token');

  const form = new FormData();
  form.append('dream_job', params.dreamJob);
  if (params.name) form.append('name', params.name);

  // Append file if provided
  form.append(
    'image',
    {
      uri: params.uri,
      name: params.filename || 'upload.jpg',
      type: params.mimeType || 'image/jpeg',
    } as any
  );

    // NOTE: Backend AI router is mounted under /ai
    const res = await fetch(`${API_BASE_URL}/ai/generate`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // NOTE: do not set Content-Type; let fetch set the multipart boundary
    },
    body: form,
  });

  if (!res.ok) {
    let msg = 'Generation failed';
    try {
      const data = await res.json();
      msg = data?.detail || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const data = (await res.json()) as GenerateImageResponse;
  const dataUri = `data:${data.content_type};base64,${data.image_base64}`;
  return dataUri;
}

export default { generateCareerImage };
