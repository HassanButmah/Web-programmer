export type StoryCategory = 'MEMORY' | 'HISTORICAL' | 'PERSONAL' | 'PLACE_REVIEW';

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  createdAt: string;
  badges?: Badge[];
  stories?: Story[];
  savedPlaces?: City[];
}

export interface Badge {
  type: string;
  label: string;
  earnedAt: string;
}

export interface City {
  id: string;
  name: string;
  nameAr?: string;
  latitude: number;
  longitude: number;
  description?: string;
  imageUrl?: string;
  storyCount: number;
  trending?: boolean;
  contributionRank?: number;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  images: string[];
  cityId: string;
  latitude: number;
  longitude: number;
  category: StoryCategory;
  userId: string;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  user?: { id: string; name: string };
  city?: { id: string; name: string; nameAr?: string };
  liked?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export const CATEGORY_LABELS: Record<StoryCategory, string> = {
  MEMORY: 'Memory',
  HISTORICAL: 'Historical',
  PERSONAL: 'Personal Story',
  PLACE_REVIEW: 'Place Review',
};

export const CATEGORY_COLORS: Record<StoryCategory, string> = {
  MEMORY: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  HISTORICAL: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  PERSONAL: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  PLACE_REVIEW: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};
