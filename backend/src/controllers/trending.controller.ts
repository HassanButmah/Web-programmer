import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asImageUrls } from '../lib/images';
import { isCityTrending } from '../services/gamification.service';

export const getTrending = async (_req: Request, res: Response): Promise<void> => {
  const [topStories, topCities, heatmapCities] = await Promise.all([
    prisma.story.findMany({
      take: 20,
      orderBy: [{ viewCount: 'desc' }, { likeCount: 'desc' }],
      include: {
        user: { select: { id: true, name: true } },
        city: { select: { id: true, name: true } },
      },
    }),
    prisma.city.findMany({
      take: 10,
      orderBy: { storyCount: 'desc' },
    }),
    prisma.city.findMany({
      where: { storyCount: { gt: 0 } },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        storyCount: true,
      },
    }),
  ]);

  const heatmap = heatmapCities.map((c) => ({
    ...c,
    intensity: Math.min(1, c.storyCount / 10),
    trending: isCityTrending(c.storyCount),
  }));

  res.json({
    topStories: topStories.map((s) => ({ ...s, images: asImageUrls(s.images) })),
    topCities: topCities.map((c) => ({
      ...c,
      trending: isCityTrending(c.storyCount),
    })),
    heatmap,
  });
};
