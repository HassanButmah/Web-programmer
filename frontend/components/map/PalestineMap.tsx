'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import type { City } from '@/lib/types';

const PALESTINE_CENTER: L.LatLngExpression = [31.7, 35.2];
const DEFAULT_ZOOM = 8;

/** Free dark tiles — no API key (CARTO + OpenStreetMap data). */
const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface PalestineMapProps {
  cities: City[];
  selectedCityId?: string | null;
  onCityClick?: (city: City) => void;
  onMapClick?: (lng: number, lat: number) => void;
  pickMode?: boolean;
  heatmapData?: { latitude: number; longitude: number; intensity: number }[];
  className?: string;
}

export default function PalestineMap({
  cities,
  selectedCityId,
  onCityClick,
  onMapClick,
  pickMode = false,
  heatmapData,
  className = '',
}: PalestineMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);
  const pickMarkerRef = useRef<L.Marker | null>(null);

  const clearMarkers = useCallback(() => {
    markersLayerRef.current?.clearLayers();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = L.map(mapContainer.current, {
      center: PALESTINE_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    heatLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      heatLayerRef.current = null;
      pickMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.off('click');

    if (pickMode && onMapClick) {
      const container = map.getContainer();
      container.style.cursor = 'crosshair';
      map.on('click', (e) => {
        onMapClick(e.latlng.lng, e.latlng.lat);
        if (pickMarkerRef.current) {
          pickMarkerRef.current.setLatLng(e.latlng);
        } else {
          pickMarkerRef.current = L.marker(e.latlng, {
            icon: L.divIcon({
              className: '',
              html: '<div class="w-4 h-4 rounded-full bg-balad-accent border-2 border-white shadow-glow"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            }),
          }).addTo(map);
        }
      });
    } else {
      map.getContainer().style.cursor = '';
      pickMarkerRef.current?.remove();
      pickMarkerRef.current = null;
    }
  }, [pickMode, onMapClick]);

  useEffect(() => {
    const layer = heatLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    heatmapData?.forEach((p) => {
      L.circle([p.latitude, p.longitude], {
        radius: 8000 + p.intensity * 12000,
        color: '#2d8a5e',
        fillColor: '#d4a853',
        fillOpacity: 0.15 + p.intensity * 0.35,
        weight: 1,
        opacity: 0.6,
      }).addTo(layer);
    });
  }, [heatmapData]);

  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    cities.forEach((city) => {
      const isSelected = city.id === selectedCityId;
      const isTrending = city.trending;

      const icon = L.divIcon({
        className: 'city-marker-leaflet',
        html: `
          <div class="flex flex-col items-center cursor-pointer group">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-glow transition-transform group-hover:scale-110 ${
              isSelected
                ? 'bg-[#2d8a5e] text-white ring-2 ring-white'
                : isTrending
                  ? 'bg-[#d4a853] text-[#0a0f0d] animate-pulse'
                  : 'bg-[#121a16] border-2 border-[#2d8a5e]/60 text-[#2d8a5e]'
            }">${city.storyCount}</div>
            <div class="mt-1 px-2 py-0.5 rounded-md bg-black/70 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              ${city.name}${isTrending ? ' 🔥' : ''}
            </div>
          </div>
        `,
        iconSize: [48, 56],
        iconAnchor: [24, 48],
      });

      const marker = L.marker([city.latitude, city.longitude], { icon });
      marker.on('click', () => onCityClick?.(city));
      marker.addTo(layer);
    });
  }, [cities, selectedCityId, onCityClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCityId) return;
    const city = cities.find((c) => c.id === selectedCityId);
    if (city) {
      map.flyTo([city.latitude, city.longitude], 10, { duration: 1.2 });
    }
  }, [selectedCityId, cities]);

  return <div ref={mapContainer} className={`w-full h-full z-0 ${className}`} />;
}
