'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Story } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/types';
import GlassCard from '@/components/ui/GlassCard';

function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const pointsEarned = searchParams.get('points');

  useEffect(() => {
    if (!id) return;
    api.stories
      .get(id)
      .then(({ story: s, liked: l }) => {
        setStory(s);
        setLiked(l);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await api.stories.like(id!);
      setLiked(res.liked);
      setStory((s) => (s ? { ...s, likeCount: res.likeCount } : s));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center md:pl-24">
        <p className="text-balad-accent animate-pulse">Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center md:pl-24">
        <p className="text-gray-500">Story not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pl-24 pt-8 px-4 max-w-3xl mx-auto">
      {pointsEarned && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 glass-card p-4 text-center text-balad-gold"
        >
          🎉 +{pointsEarned} points earned for sharing your memory!
        </motion.div>
      )}

      <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {story.images[0] && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
            <Image
              src={story.images[0]}
              alt={story.title}
              fill
              className="object-cover"
              priority
              sizes="800px"
            />
          </div>
        )}

        {story.images.length > 1 && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {story.images.slice(1).map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                <Image src={img} alt="" fill className="object-cover" sizes="200px" loading="lazy" />
              </div>
            ))}
          </div>
        )}

        <GlassCard className="p-6">
          <span
            className={`text-xs px-2 py-1 rounded-full border ${CATEGORY_COLORS[story.category]}`}
          >
            {CATEGORY_LABELS[story.category]}
          </span>
          <h1 className="font-display text-3xl font-bold mt-3">{story.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            {story.user && <span>by {story.user.name}</span>}
            {story.city && (
              <Link href={`/cities/${story.cityId}`} className="text-balad-accent hover:underline">
                {story.city.name}
              </Link>
            )}
            <span>{new Date(story.createdAt).toLocaleDateString()}</span>
          </div>

          <p className="text-gray-300 leading-relaxed mt-6 whitespace-pre-wrap">
            {story.description}
          </p>

          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10">
            <span className="text-gray-500">👁 {story.viewCount} views</span>
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center gap-1 transition-colors ${
                liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
              }`}
            >
              {liked ? '❤️' : '🤍'} {story.likeCount}
            </button>
            {!user && (
              <Link href="/login" className="text-sm text-balad-accent">
                Sign in to like
              </Link>
            )}
          </div>
        </GlassCard>
      </motion.article>
    </div>
  );
}

export default function StoryPage() {
  return (
    <Suspense>
      <StoryDetail />
    </Suspense>
  );
}
