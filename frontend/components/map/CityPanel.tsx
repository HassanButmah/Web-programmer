'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { City, Story } from '@/lib/types';
import StoryCard from '@/components/stories/StoryCard';

interface CityPanelProps {
  city: City | null;
  stories?: Story[];
  galleryImages?: string[];
  onClose: () => void;
  onAddMemory: () => void;
}

export default function CityPanel({
  city,
  stories = [],
  galleryImages = [],
  onClose,
  onAddMemory,
}: CityPanelProps) {
  if (!city) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-40 glass-panel overflow-y-auto md:right-4 md:top-4 md:bottom-4 md:rounded-2xl md:max-h-[calc(100vh-2rem)] shadow-glass"
      >
        <div className="sticky top-0 z-10 glass-panel border-b border-white/10 p-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-bold">{city.name}</h2>
              {city.trending && (
                <span className="text-xs bg-balad-gold/20 text-balad-gold px-2 py-0.5 rounded-full">
                  🔥 Trending
                </span>
              )}
            </div>
            {city.nameAr && (
              <p className="text-balad-sand text-lg" dir="rtl">
                {city.nameAr}
              </p>
            )}
            <p className="text-sm text-gray-400 mt-1">
              {city.storyCount} {city.storyCount === 1 ? 'story' : 'stories'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-6">
          {city.description && (
            <p className="text-gray-300 leading-relaxed">{city.description}</p>
          )}

          <button
            onClick={onAddMemory}
            className="w-full py-3 rounded-xl bg-balad-accent hover:bg-balad-accent/90 text-white font-semibold transition-colors shadow-glow"
          >
            ✨ Add memory here
          </button>

          {galleryImages.length > 0 && (
            <section>
              <h3 className="font-display font-semibold mb-3">Gallery</h3>
              <div className="grid grid-cols-3 gap-2">
                {galleryImages.slice(0, 6).map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="120px"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {stories.length > 0 && (
            <section>
              <h3 className="font-display font-semibold mb-3">Stories</h3>
              <div className="space-y-4">
                {stories.slice(0, 4).map((story, i) => (
                  <StoryCard key={story.id} story={story} index={i} />
                ))}
              </div>
              {city.storyCount > 4 && (
                <Link
                  href={`/cities/${city.id}`}
                  className="block text-center text-balad-accent text-sm mt-4 hover:underline"
                >
                  View all {city.storyCount} stories →
                </Link>
              )}
            </section>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
