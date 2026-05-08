import EncryptedStorage from 'react-native-encrypted-storage';

const BASE_URL = 'http://localhost:5001/api';
const TOKEN_KEY = 'musicEcosystemToken';

export interface ArtistProfile {
  _id: string;
  stageName: string;
  bio?: string;
  genres: string[];
  location?: string;
  services?: string[];
  category?: { _id: string; name: string };
  socialLinks?: { website?: string; instagram?: string; youtube?: string };
  user?: { name: string; email: string };
}

export interface Course {
  _id: string;
  title: string;
  description?: string;
  category?: { _id: string; name: string };
  lessons?: Array<{ _id?: string; title: string; content?: string; videoUrl?: string; duration?: number; published?: boolean }>;
  instructor?: { _id?: string; name: string; email?: string };
}

export interface Booking {
  _id: string;
  user?: { _id?: string; name: string; email?: string };
  artist?: { _id?: string; stageName?: string };
  service: string;
  scheduledDate: string;
  message?: string;
  status?: string;
}

export const getAuthToken = async () => {
  try {
    return await EncryptedStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = async (token: string) => {
  await EncryptedStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = async () => {
  await EncryptedStorage.removeItem(TOKEN_KEY);
};

const buildHeaders = async (json = true, withAuth = true) => {
  const headers: Record<string, string> = {};

  if (json) {
    headers['Content-Type'] = 'application/json';
  }

  if (withAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

const handleResponse = async (res: Response) => {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    if (res.status === 401) {
      await clearAuthToken();
    }
    throw new Error(data?.message || res.statusText || 'Request failed');
  }

  return data;
};

const request = async (path: string, options: RequestInit = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, options);
  return handleResponse(response);
};

const normalizeAuthResponse = (response: any) => response?.data ?? response;

export const authApi = {
  login: async (email: string, password: string) =>
    normalizeAuthResponse(
      await request('/auth/login', {
        method: 'POST',
        headers: await buildHeaders(true, false),
        body: JSON.stringify({ email, password }),
      })
    ),
  register: async (name: string, email: string, password: string, role: string) =>
    normalizeAuthResponse(
      await request('/auth/register', {
        method: 'POST',
        headers: await buildHeaders(true, false),
        body: JSON.stringify({ name, email, password, role }),
      })
    ),
  getProfile: async () =>
    request('/auth/profile', {
      method: 'GET',
      headers: await buildHeaders(),
    }),
  updateProfile: async (update: Record<string, any>) =>
    request('/auth/profile', {
      method: 'PUT',
      headers: await buildHeaders(),
      body: JSON.stringify(update),
    }),
};

export const artistsApi = {
  me: async () =>
    request('/artists/me', {
      method: 'GET',
      headers: await buildHeaders(),
    }),
  list: async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/artists${qs}`, {
      method: 'GET',
      headers: await buildHeaders(false, false),
    });
  },
  get: async (id: string) =>
    request(`/artists/${id}`, {
      method: 'GET',
      headers: await buildHeaders(false, false),
    }),
  upsert: async (profile: Record<string, any>) =>
    request('/artists/me', {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify(profile),
    }),
  updateAvailability: async (availability: 'available' | 'busy') =>
    request('/artists/me/availability', {
      method: 'PUT',
      headers: await buildHeaders(),
      body: JSON.stringify({ availability }),
    }),
  rate: async (id: string, value: number, review?: string) =>
    request(`/artists/${id}/rate`, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify({ value, review }),
    }),
};

export const hireApi = {
  book: async (payload: { artistId: string; service: string; scheduledDate: string; message?: string }) =>
    request('/hire/book', {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify(payload),
    }),
};

export const learningApi = {
  list: async () =>
    request('/learning', {
      method: 'GET',
      headers: await buildHeaders(false, false),
    }),
  get: async (id: string) =>
    request(`/learning/${id}`, {
      method: 'GET',
      headers: await buildHeaders(false, false),
    }),
};

export const uploadApi = {
  uploadImage: async (uri: string, name: string, type: string) => {
    const formData = new FormData();
    formData.append('file', { uri, name, type } as any);
    const response = await fetch(`${BASE_URL}/uploads/image`, {
      method: 'POST',
      headers: await buildHeaders(false, true),
      body: formData,
    });
    return handleResponse(response);
  },
  uploadVideo: async (uri: string, name: string, type: string) => {
    const formData = new FormData();
    formData.append('file', { uri, name, type } as any);
    const response = await fetch(`${BASE_URL}/uploads/video`, {
      method: 'POST',
      headers: await buildHeaders(false, true),
      body: formData,
    });
    return handleResponse(response);
  },
};

export const bookingsApi = {
  myBookings: async () =>
    request('/bookings/me', { method: 'GET', headers: await buildHeaders() }),
  artistBookings: async () =>
    request('/bookings/artist', { method: 'GET', headers: await buildHeaders() }),
  updateStatus: async (id: string, status: string) =>
    request(`/bookings/${id}/status`, {
      method: 'PUT',
      headers: await buildHeaders(),
      body: JSON.stringify({ status }),
    }),
};

export const bandApi = {
  list: async () =>
    request('/bands', { method: 'GET', headers: await buildHeaders(false, false) }),
  get: async (id: string) =>
    request(`/bands/${id}`, { method: 'GET', headers: await buildHeaders(false, false) }),
  create: async (data: Record<string, any>) =>
    request('/bands', { method: 'POST', headers: await buildHeaders(), body: JSON.stringify(data) }),
  join: async (id: string, role?: string) =>
    request(`/bands/${id}/join`, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify({ role: role || 'Member' }),
    }),
  rate: async (id: string, value: number) =>
    request(`/bands/${id}/rate`, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify({ value }),
    }),
};

export const notificationsApi = {
  list: async () =>
    request('/notifications', { method: 'GET', headers: await buildHeaders() }),
  markRead: async (id: string) =>
    request(`/notifications/${id}/read`, { method: 'PUT', headers: await buildHeaders() }),
  markAllRead: async () =>
    request('/notifications/read-all', { method: 'PUT', headers: await buildHeaders() }),
};

export const enrollmentApi = {
  enroll: async (courseId: string) =>
    request(`/learning/${courseId}/enroll`, { method: 'POST', headers: await buildHeaders() }),
  myEnrollments: async () =>
    request('/learning/enrolled', { method: 'GET', headers: await buildHeaders() }),
  completeLesson: async (courseId: string, lessonId: string) =>
    request(`/learning/${courseId}/lessons/${lessonId}/complete`, {
      method: 'POST',
      headers: await buildHeaders(),
    }),
  getLesson: async (lessonId: string) =>
    request(`/learning/lesson/${lessonId}`, {
      method: 'GET',
      headers: await buildHeaders(false, false),
    }),
};
