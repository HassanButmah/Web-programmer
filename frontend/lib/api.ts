import type { City, Pagination, Story, User } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('baladverse_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      request<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  cities: {
    list: () => request<{ cities: City[] }>('/cities'),
    get: (id: string) =>
      request<{
        city: City;
        trendingStories: Story[];
        recentStories: Story[];
        galleryImages: string[];
        cityRanking: { id: string; name: string; storyCount: number }[];
      }>(`/cities/${id}`),
  },

  stories: {
    list: (params?: {
      page?: number;
      limit?: number;
      cityId?: string;
      category?: string;
      sort?: string;
    }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.cityId) q.set('cityId', params.cityId);
      if (params?.category) q.set('category', params.category);
      if (params?.sort) q.set('sort', params.sort);
      const query = q.toString();
      return request<{ stories: Story[]; pagination: Pagination }>(
        `/stories${query ? `?${query}` : ''}`
      );
    },
    get: (id: string) => request<{ story: Story; liked: boolean }>(`/stories/${id}`),
    byCity: (cityId: string, page = 1) =>
      request<{ city: City; stories: Story[]; pagination: Pagination }>(
        `/stories/city/${cityId}?page=${page}`
      ),
    create: (formData: FormData) =>
      request<{ story: Story; pointsEarned: number; totalPoints: number }>('/stories', {
        method: 'POST',
        body: formData,
      }),
    like: (id: string) =>
      request<{ liked: boolean; likeCount: number }>(`/stories/${id}/like`, {
        method: 'POST',
      }),
  },

  users: {
    profile: () => request<{ user: User }>('/users/profile'),
    savePlace: (cityId: string) =>
      request<{ saved: City }>('/users/saved-places', {
        method: 'POST',
        body: JSON.stringify({ cityId }),
      }),
    unsavePlace: (cityId: string) =>
      request<{ success: boolean }>(`/users/saved-places/${cityId}`, {
        method: 'DELETE',
      }),
  },

  trending: () =>
    request<{
      topStories: Story[];
      topCities: City[];
      heatmap: (City & { intensity: number })[];
    }>('/trending'),
};

export function setAuthToken(token: string) {
  localStorage.setItem('baladverse_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('baladverse_token');
  localStorage.removeItem('baladverse_user');
}

export function saveUser(user: User) {
  localStorage.setItem('baladverse_user', JSON.stringify(user));
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('baladverse_user');
  return raw ? JSON.parse(raw) : null;
}
