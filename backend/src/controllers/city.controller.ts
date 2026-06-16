import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asImageUrls } from '../lib/images';

function withImages<T extends { images: unknown }>(story: T) {
  return { ...story, images: asImageUrls(story.images) };
}
import { isCityTrending } from '../services/gamification.service';

export const getCities = async (_req: Request, res: Response): Promise<void> => {
  const cities = await prisma.city.findMany({
    orderBy: { storyCount: 'desc' },
  });

  const enriched = cities.map((city) => ({
    ...city,
    trending: isCityTrending(city.storyCount),
  }));

  res.json({ cities: enriched });
};

export const getCityById = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);

  const city = await prisma.city.findUnique({
    where: { id },
  });

  const trendingStories = await prisma.story.findMany({
    where: { cityId: id },
    take: 6,
    orderBy: { viewCount: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  if (!city) {
    res.status(404).json({ error: 'City not found' });
    return;
  }

  const recentStories = await prisma.story.findMany({
    where: { cityId: id },
    take: 12,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  const galleryImages = recentStories
    .flatMap((s) => asImageUrls(s.images))
    .slice(0, 12);

  const ranking = await prisma.city.findMany({
    orderBy: { storyCount: 'desc' },
    take: 10,
    select: { id: true, name: true, storyCount: true },
  });

  const rank = ranking.findIndex((c) => c.id === id) + 1;

  res.json({
    city: {
      ...city,
      trending: isCityTrending(city.storyCount),
      contributionRank: rank || null,
    },
    trendingStories: trendingStories.map(withImages),
    recentStories: recentStories.map(withImages),
    galleryImages,
    cityRanking: ranking,
  });
};
