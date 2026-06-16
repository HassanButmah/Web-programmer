'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import type { City, Story } from '@/lib/types';
import StoryCard from '@/components/stories/StoryCard';
import GlassCard from '@/components/ui/GlassCard';

const PalestineMap = dynamic(() => import('@/components/map/PalestineMap'), {
  ssr: false,
});

export default function TrendingPage() {
  const [topStories, setTopStories] = useState<Story[]>([]);
  const [topCities, setTopCities] = useState<City[]>([]);
  const [heatmap, setHeatmap] = useState<
    { latitude: number; longitude: number; intensity: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.trending()
      .then((data) => {
        setTopStories(data.topStories);
        setTopCities(data.topCities);
        setHeatmap(
          data.heatmap.map((h) => ({
            latitude: h.latitude,
            longitude: h.longitude,
            intensity: h.intensity,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pl-24">
      <div className="px-4 pt-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-3xl font-bold mb-2">Trending</h1>
          <p className="text-gray-400 mb-6">What&apos;s hot across BaladVerse</p>
        </motion.div>
      </div>

      <div className="relative h-64 md:h-80 mx-4 rounded-2xl overflow-hidden glass-card mb-8">
        {!loading && (
          <PalestineMap
            cities={topCities}
            heatmapData={heatmap}
            className="h-full"
          />
        )}
        <div className="absolute top-3 left-3 glass-card px-3 py-1.5 text-xs text-balad-gold">
          Activity heatmap
        </div>
      </div>

      <div className="px-4 max-w-6xl mx-auto space-y-10">
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">Most Viewed Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topStories.slice(0, 9).map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-4">Most Loved Cities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topCities.map((city, i) => (
              <GlassCard key={city.id} className="p-4 flex items-center gap-4">
                <span className="text-3xl font-bold text-balad-accent/40">#{i + 1}</span>
                <div>
                  <p className="font-semibold text-lg">
                    {city.name} {city.trending && '🔥'}
                  </p>
                  <p className="text-sm text-gray-400">{city.storyCount} stories shared</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
