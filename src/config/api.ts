const DEFAULT_API_URL = 'http://localhost:3000/api';

export const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || API_URL.replace(/\/api\/?$/, '');

export const GOOGLE_AUTH_URL = `${API_URL}/auth/google`;

export const API_TIMEOUT = 10000;

export function resolveAssetUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }

  const cleanUrl = url.replace(/^\/?api\//, '/');
  const finalPath = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;

  return `${API_BASE_URL}${finalPath}`;
}
