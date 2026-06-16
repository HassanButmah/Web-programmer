'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { City, Story } from '@/lib/types';
import StoryCard from '@/components/stories/StoryCard';
import GlassCard from '@/components/ui/GlassCard';

export default function CityPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [city, setCity] = useState<City | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [ranking, setRanking] = useState<{ id: string; name: string; storyCount: number }[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.cities
      .get(id)
      .then((data) => {
        setCity(data.city);
        setStories(data.recentStories);
        setGallery(data.galleryImages);
        setRanking(data.cityRanking);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.savedPlaces && city) {
      setSaved(user.savedPlaces.some((p) => p.id === city.id));
    }
  }, [user, city]);

  const toggleSave = async () => {
    if (!user || !city) {
      router.push('/login');
      return;
    }
    try {
      if (saved) {
        await api.users.unsavePlace(city.id);
        setSaved(false);
      } else {
        await api.users.savePlace(city.id);
        setSaved(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center md:pl-24">
        <p className="text-balad-accent animate-pulse">Loading city...</p>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center md:pl-24">
        <p className="text-gray-500">City not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pl-24 pt-8 px-4 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-bold">{city.name}</h1>
                {city.trending && (
                  <span className="text-sm bg-balad-gold/20 text-balad-gold px-2 py-0.5 rounded-full">
                    🔥 Trending
                  </span>
                )}
              </div>
              {city.nameAr && (
                <p className="text-2xl text-balad-sand mt-1" dir="rtl">
                  {city.nameAr}
                </p>
              )}
              <p className="text-gray-400 mt-2">{city.description}</p>
              <p className="text-sm text-balad-accent mt-2">
                {city.storyCount} stories
                {city.contributionRank && ` · Rank #${city.contributionRank} contributor`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleSave}
                className={`px-4 py-2 rounded-xl border text-sm transition-colors ${
                  saved
                    ? 'border-balad-gold text-balad-gold bg-balad-gold/10'
                    : 'border-white/20 hover:border-balad-accent'
                }`}
              >
                {saved ? '★ Saved' : '☆ Save place'}
              </button>
              <button
                onClick={() => router.push(`/add?cityId=${city.id}`)}
                className="px-4 py-2 rounded-xl bg-balad-accent text-white text-sm font-medium"
              >
                Add memory
              </button>
            </div>
          </div>
        </GlassCard>

        {gallery.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {gallery.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <Image src={img} alt="" fill className="object-cover" sizes="200px" loading="lazy" />
                </div>
              ))}
            </div>
          </section>
        )}

        {ranking.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">City Rankings</h2>
            <div className="space-y-2">
              {ranking.map((c, i) => (
                <div
                  key={c.id}
                  className={`flex justify-between p-3 rounded-xl ${
                    c.id === city.id ? 'bg-balad-accent/10 border border-balad-accent/30' : 'bg-white/5'
                  }`}
                >
                  <span>
                    #{i + 1} {c.name}
                  </span>
                  <span className="text-balad-gold">{c.storyCount}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-xl font-semibold mb-4">Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {stories.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        </section>
      </motion.div>
    </div>
  );
}
