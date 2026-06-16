'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import type { City } from '@/lib/types';
import GlassCard from '@/components/ui/GlassCard';

export default function ExplorePage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.cities
      .list()
      .then(({ cities: c }) => setCities(c))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const trending = cities.filter((c) => c.trending);
  const mostActive = [...cities].sort((a, b) => b.storyCount - a.storyCount).slice(0, 5);

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pl-24 pt-8 px-4 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-2">Explore Palestine</h1>
        <p className="text-gray-400 mb-8">
          {cities.length} cities waiting to share their stories
        </p>
      </motion.div>

      {trending.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            🔥 Trending Locations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trending.map((city, i) => (
              <CityExploreCard key={city.id} city={city} index={i} highlight />
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="font-display text-xl font-semibold mb-4">Most Active Areas</h2>
        <div className="space-y-2">
          {mostActive.map((city, i) => (
            <Link key={city.id} href={`/cities/${city.id}`}>
              <GlassCard className="p-4 flex items-center justify-between hover:border-balad-accent/30 transition-colors mb-2">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-balad-accent/60 w-8">
                    #{i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{city.name}</p>
                    {city.nameAr && (
                      <p className="text-sm text-balad-sand" dir="rtl">
                        {city.nameAr}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-balad-gold font-medium">{city.storyCount} stories</span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">All Cities</h2>
        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading cities...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city, i) => (
              <CityExploreCard key={city.id} city={city} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CityExploreCard({
  city,
  index,
  highlight,
}: {
  city: City;
  index: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/cities/${city.id}`}>
        <GlassCard
          className={`p-5 hover:border-balad-accent/40 transition-all ${
            highlight ? 'border-balad-gold/30' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-display text-lg font-semibold">{city.name}</h3>
              {city.nameAr && (
                <p className="text-balad-sand" dir="rtl">
                  {city.nameAr}
                </p>
              )}
            </div>
            {city.trending && <span className="text-lg">🔥</span>}
          </div>
          <p className="text-sm text-gray-400 mt-2 line-clamp-2">
            {city.description || 'Discover stories from this city'}
          </p>
          <p className="text-balad-accent text-sm mt-3 font-medium">
            {city.storyCount} stories →
          </p>
        </GlassCard>
      </Link>
    </motion.div>
  );
}
