'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { City, StoryCategory } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/types';
import GlassCard from '@/components/ui/GlassCard';

const PalestineMap = dynamic(() => import('@/components/map/PalestineMap'), {
  ssr: false,
});

function AddMemoryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [cities, setCities] = useState<City[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<StoryCategory>('MEMORY');
  const [cityId, setCityId] = useState(searchParams.get('cityId') || '');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/add');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    api.cities.list().then(({ cities: c }) => {
      setCities(c);
      const preselect = searchParams.get('cityId');
      if (preselect) {
        const city = c.find((x) => x.id === preselect);
        if (city) {
          setLat(city.latitude);
          setLng(city.longitude);
        }
      }
    });
  }, [searchParams]);

  const handleMapClick = (longitude: number, latitude: number) => {
    setLng(longitude);
    setLat(latitude);
  };

  const handleCityChange = (id: string) => {
    setCityId(id);
    const city = cities.find((c) => c.id === id);
    if (city) {
      setLat(city.latitude);
      setLng(city.longitude);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !cityId || lat == null || lng == null) {
      setError('Please fill all fields and pick a location on the map');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('cityId', cityId);
      formData.append('latitude', String(lat));
      formData.append('longitude', String(lng));
      formData.append('category', category);
      images.forEach((img) => formData.append('images', img));

      const { story, pointsEarned } = await api.stories.create(formData);
      router.push(`/stories/${story.id}?points=${pointsEarned}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create story');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center md:pl-24">
        <p className="text-balad-accent animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pl-24 pt-8 px-4 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-2">Add a Memory</h1>
        <p className="text-gray-400 mb-6">Share your story tied to a place in Palestine</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassCard className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-balad-accent"
              placeholder="Give your memory a title"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-balad-accent resize-none"
              placeholder="Tell your story..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">City</label>
              <select
                value={cityId}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                required
              >
                <option value="">Select city</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StoryCategory)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >
                {(Object.keys(CATEGORY_LABELS) as StoryCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Images (up to 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files || []))}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-balad-accent file:text-white file:cursor-pointer"
            />
          </div>
        </GlassCard>

        <GlassCard className="overflow-hidden">
          <p className="p-4 text-sm text-gray-400 border-b border-white/10">
            Click the map to set your memory&apos;s exact location
            {lat != null && lng != null && (
              <span className="text-balad-accent ml-2">
                ({lat.toFixed(4)}, {lng.toFixed(4)})
              </span>
            )}
          </p>
          <div className="h-56">
            <PalestineMap
              cities={cities}
              pickMode
              onMapClick={handleMapClick}
              className="h-full"
            />
          </div>
        </GlassCard>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-balad-accent hover:bg-balad-accent/90 disabled:opacity-50 text-white font-semibold shadow-glow transition-colors"
        >
          {submitting ? 'Sharing...' : 'Share Memory (+10 points)'}
        </button>
      </form>
    </div>
  );
}

export default function AddPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AddMemoryForm />
    </Suspense>
  );
}
