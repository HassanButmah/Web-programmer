import { BadgeType } from '@prisma/client';
import { prisma } from '../lib/prisma';

const POINTS_PER_STORY = 10;
const TRENDING_THRESHOLD = 5;

export async function awardStoryPoints(userId: string): Promise<number> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { points: { increment: POINTS_PER_STORY } },
  });
  await checkAndAwardBadges(userId);
  return user.points;
}

export async function checkAndAwardBadges(userId: string): Promise<void> {
  const [storyCount, cityCount, memoryCount] = await Promise.all([
    prisma.story.count({ where: { userId } }),
    prisma.story.findMany({
      where: { userId },
      select: { cityId: true },
      distinct: ['cityId'],
    }),
    prisma.story.count({
      where: { userId, category: 'MEMORY' },
    }),
  ]);

  const badges: { type: BadgeType; condition: boolean }[] = [
    { type: 'STORY_KEEPER', condition: storyCount >= 3 },
    { type: 'CITY_EXPLORER', condition: cityCount.length >= 5 },
    { type: 'MEMORY_COLLECTOR', condition: memoryCount >= 5 },
  ];

  for (const badge of badges) {
    if (badge.condition) {
      await prisma.userBadge.upsert({
        where: {
          userId_type: { userId, type: badge.type },
        },
        create: { userId, type: badge.type },
        update: {},
      });
    }
  }
}

export function isCityTrending(storyCount: number): boolean {
  return storyCount >= TRENDING_THRESHOLD;
}

export const BADGE_LABELS: Record<BadgeType, string> = {
  STORY_KEEPER: 'Story Keeper',
  CITY_EXPLORER: 'City Explorer',
  MEMORY_COLLECTOR: 'Memory Collector',
};
