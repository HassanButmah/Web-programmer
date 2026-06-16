import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { asImageUrls } from '../lib/images';
import { AuthRequest } from '../middleware/auth.middleware';
import { BADGE_LABELS } from '../services/gamification.service';

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      points: true,
      createdAt: true,
      badges: true,
      stories: {
        orderBy: { createdAt: 'desc' },
        include: {
          city: { select: { id: true, name: true } },
        },
      },
      savedPlaces: {
        include: {
          city: true,
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const badges = user.badges.map((b) => ({
    type: b.type,
    label: BADGE_LABELS[b.type],
    earnedAt: b.earnedAt,
  }));

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      points: user.points,
      createdAt: user.createdAt,
      badges,
      stories: user.stories.map((s) => ({ ...s, images: asImageUrls(s.images) })),
      savedPlaces: user.savedPlaces.map((sp) => sp.city),
    },
  });
};

export const savePlace = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { cityId } = req.body;
  if (!cityId) {
    res.status(400).json({ error: 'cityId is required' });
    return;
  }

  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) {
    res.status(404).json({ error: 'City not found' });
    return;
  }

  const saved = await prisma.savedPlace.upsert({
    where: {
      userId_cityId: { userId: req.user!.userId, cityId },
    },
    create: { userId: req.user!.userId, cityId },
    update: {},
    include: { city: true },
  });

  res.json({ saved: saved.city });
};

export const unsavePlace = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const cityId = String(req.params.cityId);

  await prisma.savedPlace.deleteMany({
    where: { userId: req.user!.userId, cityId },
  });

  res.json({ success: true });
};
