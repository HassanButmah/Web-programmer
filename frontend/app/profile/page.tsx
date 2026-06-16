'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { User } from '@/lib/types';
import StoryCard from '@/components/stories/StoryCard';
import GlassCard from '@/components/ui/GlassCard';

const BADGE_ICONS: Record<string, string> = {
  STORY_KEEPER: '📚',
  CITY_EXPLORER: '🗺️',
  MEMORY_COLLECTOR: '💎',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login?redirect=/profile');
      return;
    }
    if (authUser) {
      api.users
        .profile()
        .then(({ user }) => setProfile(user))
        .catch(() => setProfile(authUser))
        .finally(() => setLoading(false));
    }
  }, [authUser, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center md:pl-24">
        <p className="text-balad-accent animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pl-24 pt-8 px-4 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-balad-accent/20 flex items-center justify-center text-2xl font-bold text-balad-accent">
                {profile.name.charAt(0)}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
                <p className="text-gray-400 text-sm">{profile.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="text-sm text-gray-500 hover:text-red-400"
            >
              Sign out
            </button>
          </div>

          <div className="mt-6 flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-balad-gold">{profile.points}</p>
              <p className="text-xs text-gray-500">Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{profile.stories?.length || 0}</p>
              <p className="text-xs text-gray-500">Stories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{profile.savedPlaces?.length || 0}</p>
              <p className="text-xs text-gray-500">Saved</p>
            </div>
          </div>
        </GlassCard>

        {profile.badges && profile.badges.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">Badges</h2>
            <div className="flex flex-wrap gap-3">
              {profile.badges.map((badge) => (
                <GlassCard key={badge.type} className="px-4 py-3 flex items-center gap-2">
                  <span className="text-2xl">{BADGE_ICONS[badge.type] || '🏅'}</span>
                  <div>
                    <p className="font-medium text-sm">{badge.label}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        {profile.badges?.length === 0 && (
          <GlassCard className="p-4 mb-8 text-sm text-gray-400">
            Earn badges: Story Keeper (3 stories), City Explorer (5 cities), Memory Collector (5
            memories)
          </GlassCard>
        )}

        {profile.savedPlaces && profile.savedPlaces.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">Saved Places</h2>
            <div className="flex flex-wrap gap-2">
              {profile.savedPlaces.map((city) => (
                <Link
                  key={city.id}
                  href={`/cities/${city.id}`}
                  className="glass-card px-4 py-2 text-sm hover:border-balad-accent/40"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Your Stories</h2>
            <Link href="/add" className="text-balad-accent text-sm hover:underline">
              + Add memory
            </Link>
          </div>
          {profile.stories && profile.stories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {profile.stories.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          ) : (
            <GlassCard className="p-8 text-center text-gray-500">
              <p>You haven&apos;t shared any stories yet.</p>
              <Link href="/add" className="text-balad-accent mt-2 inline-block hover:underline">
                Share your first memory →
              </Link>
            </GlassCard>
          )}
        </section>
      </motion.div>
    </div>
  );
}
