'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Story } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/types';

interface StoryCardProps {
  story: Story;
  index?: number;
}

export default function StoryCard({ story, index = 0 }: StoryCardProps) {
  const image = story.images[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card overflow-hidden group cursor-pointer hover:border-balad-accent/30 transition-colors"
    >
      <Link href={`/stories/${story.id}`}>
        {image && (
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={image}
              alt={story.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <span
              className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full border ${CATEGORY_COLORS[story.category]}`}
            >
              {CATEGORY_LABELS[story.category]}
            </span>
          </div>
        )}
        <div className="p-4">
          <h3 className="font-display font-semibold text-lg line-clamp-2 group-hover:text-balad-accent transition-colors">
            {story.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{story.description}</p>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>{story.city?.name || 'Palestine'}</span>
            <div className="flex gap-3">
              <span>👁 {story.viewCount}</span>
              <span>❤️ {story.likeCount}</span>
            </div>
          </div>
          {story.user && (
            <p className="text-xs text-gray-600 mt-2">by {story.user.name}</p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
