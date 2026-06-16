'use client';

import { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import type { City, Story, StoryCategory } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/types';
import StoryCard from '@/components/stories/StoryCard';
import GlassCard from '@/components/ui/GlassCard';

export default function FeedPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { ref, inView } = useInView({ threshold: 0 });

  const loadStories = useCallback(
    async (pageNum: number, reset = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const { stories: s, pagination } = await api.stories.list({
          page: pageNum,
          limit: 12,
          cityId: cityFilter || undefined,
          category: categoryFilter || undefined,
        });
        setStories((prev) => (reset ? s : [...prev, ...s]));
        setHasMore(pagination.hasMore);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [cityFilter, categoryFilter, loading]
  );

  useEffect(() => {
    api.cities.list().then(({ cities: c }) => setCities(c)).catch(console.error);
  }, []);

  useEffect(() => {
    setPage(1);
    loadStories(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityFilter, categoryFilter]);

  useEffect(() => {
    if (!inView || !hasMore || loading || stories.length === 0) return;
    const next = page + 1;
    setPage(next);
    loadStories(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pl-24 pt-8 px-4 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-2">Story Feed</h1>
        <p className="text-gray-400 mb-6">Discover memories from across Palestine</p>
      </motion.div>

      <GlassCard className="p-4 mb-6 flex flex-wrap gap-3">
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {(Object.keys(CATEGORY_LABELS) as StoryCategory[]).map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </GlassCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stories.map((story, i) => (
          <StoryCard key={story.id} story={story} index={i} />
        ))}
      </div>

      {stories.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-12">No stories yet. Be the first to share!</p>
      )}

      <div ref={ref} className="h-10 flex items-center justify-center mt-6">
        {loading && <span className="text-balad-accent animate-pulse">Loading...</span>}
        {!hasMore && stories.length > 0 && (
          <span className="text-gray-600 text-sm">You&apos;ve reached the end</span>
        )}
      </div>
    </div>
  );
}
