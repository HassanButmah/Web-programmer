'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import type { City, Story } from '@/lib/types';
import CityPanel from '@/components/map/CityPanel';

const PalestineMap = dynamic(() => import('@/components/map/PalestineMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-balad-night">
      <div className="animate-pulse text-balad-accent">Loading map...</div>
    </div>
  ),
});

export default function HomePage() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [panelStories, setPanelStories] = useState<Story[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.cities
      .list()
      .then(({ cities: c }) => setCities(c))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCityClick = useCallback(async (city: City) => {
    setSelectedCity(city);
    try {
      const data = await api.cities.get(city.id);
      setPanelStories(data.recentStories);
      setGalleryImages(data.galleryImages);
      setSelectedCity(data.city);
    } catch {
      setPanelStories([]);
    }
  }, []);

  const handleClose = () => setSelectedCity(null);

  const handleAddMemory = () => {
    if (selectedCity) {
      router.push(`/add?cityId=${selectedCity.id}`);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <PalestineMap
        cities={cities}
        selectedCityId={selectedCity?.id}
        onCityClick={handleCityClick}
        className="absolute inset-0"
      />

      {/* Header overlay */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-30 p-4 md:pl-24 pointer-events-none"
      >
        <div className="glass-card inline-block px-5 py-3 pointer-events-auto">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            Balad<span className="text-balad-accent">Verse</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Explore Palestine through stories & memories
          </p>
        </div>
      </motion.header>

      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-balad-night/50">
          <div className="glass-card px-6 py-4 text-balad-accent animate-pulse">
            Loading cities...
          </div>
        </div>
      )}

      {selectedCity && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={handleClose}
          />
          <CityPanel
            city={selectedCity}
            stories={panelStories}
            galleryImages={galleryImages}
            onClose={handleClose}
            onAddMemory={handleAddMemory}
          />
        </>
      )}
    </div>
  );
}
