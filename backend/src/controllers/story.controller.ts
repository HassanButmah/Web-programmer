import { Response } from 'express';
import { StoryCategory } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asImageUrls } from '../lib/images';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadImages } from '../services/cloudinary.service';
import { awardStoryPoints } from '../services/gamification.service';

const storyInclude = {
  user: { select: { id: true, name: true } },
  city: { select: { id: true, name: true, nameAr: true } },
};

function withImages<T extends { images: unknown }>(story: T) {
  return { ...story, images: asImageUrls(story.images) };
}

const VALID_CATEGORIES: StoryCategory[] = [
  'MEMORY',
  'HISTORICAL',
  'PERSONAL',
  'PLACE_REVIEW',
];

export const createStory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { title, description, cityId, latitude, longitude, category, images: bodyImages } =
    req.body;

  if (!title || !description || !cityId || latitude == null || longitude == null || !category) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  if (!VALID_CATEGORIES.includes(category)) {
    res.status(400).json({ error: 'Invalid category' });
    return;
  }

  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) {
    res.status(404).json({ error: 'City not found' });
    return;
  }

  let imageUrls: string[] = [];
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    imageUrls = await uploadImages(req.files as Express.Multer.File[]);
  } else if (bodyImages && Array.isArray(bodyImages)) {
    imageUrls = bodyImages;
  }

  const story = await prisma.story.create({
    data: {
      title,
      description,
      images: imageUrls,
      cityId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      category,
      userId: req.user!.userId,
    },
    include: storyInclude,
  });

  await prisma.city.update({
    where: { id: cityId },
    data: { storyCount: { increment: 1 } },
  });

  const points = await awardStoryPoints(req.user!.userId);

  res.status(201).json({
    story: withImages(story),
    pointsEarned: 10,
    totalPoints: points,
  });
};

export const getStories = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 12);
  const skip = (page - 1) * limit;
  const { cityId, category, sort } = req.query;

  const where: Record<string, unknown> = {};
  if (cityId) where.cityId = cityId;
  if (category && VALID_CATEGORIES.includes(category as StoryCategory)) {
    where.category = category;
  }

  const orderBy =
    sort === 'views'
      ? { viewCount: 'desc' as const }
      : sort === 'likes'
        ? { likeCount: 'desc' as const }
        : { createdAt: 'desc' as const };

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: storyInclude,
    }),
    prisma.story.count({ where }),
  ]);

  res.json({
    stories: stories.map(withImages),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + stories.length < total,
    },
  });
};

export const getStoryById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const id = String(req.params.id);

  const story = await prisma.story.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
    include: {
      ...storyInclude,
      city: true,
    },
  });

  if (!story) {
    res.status(404).json({ error: 'Story not found' });
    return;
  }

  let liked = false;
  if (req.user) {
    const like = await prisma.storyLike.findUnique({
      where: {
        userId_storyId: { userId: req.user.userId, storyId: id },
      },
    });
    liked = !!like;
  }

  res.json({ story: withImages(story), liked });
};

export const getStoriesByCity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const cityId = String(req.params.cityId);
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 12);
  const skip = (page - 1) * limit;

  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) {
    res.status(404).json({ error: 'City not found' });
    return;
  }

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where: { cityId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: storyInclude,
    }),
    prisma.story.count({ where: { cityId } }),
  ]);

  res.json({
    city,
    stories: stories.map(withImages),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + stories.length < total,
    },
  });
};

export const likeStory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const id = String(req.params.id);

  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) {
    res.status(404).json({ error: 'Story not found' });
    return;
  }

  const existing = await prisma.storyLike.findUnique({
    where: {
      userId_storyId: { userId: req.user!.userId, storyId: id },
    },
  });

  if (existing) {
    await prisma.storyLike.delete({ where: { id: existing.id } });
    const updated = await prisma.story.update({
      where: { id },
      data: { likeCount: { decrement: 1 } },
    });
    res.json({ liked: false, likeCount: updated.likeCount });
    return;
  }

  await prisma.storyLike.create({
    data: { userId: req.user!.userId, storyId: id },
  });
  const updated = await prisma.story.update({
    where: { id },
    data: { likeCount: { increment: 1 } },
  });
  res.json({ liked: true, likeCount: updated.likeCount });
};
