import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CITIES = [
  { name: 'Jerusalem', nameAr: 'القدس', latitude: 31.7683, longitude: 35.2137, description: 'The heart of Palestine — sacred, resilient, eternal.' },
  { name: 'Ramallah', nameAr: 'رام الله', latitude: 31.9038, longitude: 35.2034, description: 'A vibrant cultural hub in the West Bank.' },
  { name: 'Gaza', nameAr: 'غزة', latitude: 31.3547, longitude: 34.3088, description: 'The resilient coastal city of the Strip.' },
  { name: 'Hebron', nameAr: 'الخليل', latitude: 31.5326, longitude: 35.0998, description: 'Ancient city of Ibrahim, rich in heritage.' },
  { name: 'Nablus', nameAr: 'نابلس', latitude: 32.2211, longitude: 35.2544, description: 'Home of knafeh and mountain spirit.' },
  { name: 'Bethlehem', nameAr: 'بيت لحم', latitude: 31.7054, longitude: 35.2024, description: 'City of peace and olive wood crafts.' },
  { name: 'Jenin', nameAr: 'جنين', latitude: 32.4607, longitude: 35.3, description: 'Green fields and steadfast community.' },
  { name: 'Tulkarm', nameAr: 'طولكرم', latitude: 32.3104, longitude: 35.0286, description: 'Gateway city of the northern West Bank.' },
  { name: 'Jericho', nameAr: 'أريحا', latitude: 31.8611, longitude: 35.4617, description: 'The oldest continuously inhabited city on earth.' },
  { name: 'Jaffa', nameAr: 'يافا', latitude: 32.05, longitude: 34.75, description: 'Historic port city on the Mediterranean.' },
  { name: 'Haifa', nameAr: 'حيفا', latitude: 32.794, longitude: 34.9896, description: 'Mountain meets sea — a mosaic of cultures.' },
  { name: 'Nazareth', nameAr: 'الناصرة', latitude: 32.6996, longitude: 35.3035, description: 'Galilee\'s largest Arab city.' },
  { name: 'Akka', nameAr: 'عكا', latitude: 32.9275, longitude: 35.0833, description: 'Walled old city by the sea.' },
  { name: 'Safad', nameAr: 'صفد', latitude: 32.9646, longitude: 35.496, description: 'City of mystics in the Upper Galilee.' },
  { name: 'Lydd', nameAr: 'اللد', latitude: 31.951, longitude: 34.8882, description: 'Central plains city with deep roots.' },
];

const SAMPLE_STORIES = [
  { title: 'Friday at Al-Aqsa', category: 'MEMORY' as const, description: 'The golden dome glowing at sunset. Families gathering, children playing in the courtyards. A memory etched forever in my heart.' },
  { title: 'Knafeh in the Old City', category: 'PLACE_REVIEW' as const, description: 'The best knafeh in Nablus — crispy, sweet, dripping with syrup. Al-Aqsa sweet shop never disappoints.' },
  { title: 'Olive Harvest Season', category: 'PERSONAL' as const, description: 'Every autumn our family gathers in the groves near Ramallah. Hands stained purple, laughter echoing through the hills.' },
  { title: 'The Great Mosque of Gaza', category: 'HISTORICAL' as const, description: 'Built in the 7th century, this mosque has witnessed centuries of history. Its minaret still calls the faithful to prayer.' },
  { title: 'Sunset over the Mediterranean', category: 'MEMORY' as const, description: 'Standing on Jaffa\'s ancient walls watching the sun dip into the sea. The orange sky reflected on the water — Palestine\'s coastline at its finest.' },
];

async function main() {
  console.log('Seeding BaladVerse database...');

  for (const city of CITIES) {
    await prisma.city.upsert({
      where: { name: city.name },
      create: city,
      update: city,
    });
  }

  const password = await bcrypt.hash('demo1234', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@baladverse.com' },
    create: {
      name: 'Ahmad Khalil',
      email: 'demo@baladverse.com',
      password,
      points: 50,
    },
    update: {},
  });

  const cities = await prisma.city.findMany();
  const cityMap = Object.fromEntries(cities.map((c) => [c.name, c]));

  const storyAssignments = [
    { city: 'Jerusalem', ...SAMPLE_STORIES[0] },
    { city: 'Nablus', ...SAMPLE_STORIES[1] },
    { city: 'Ramallah', ...SAMPLE_STORIES[2] },
    { city: 'Gaza', ...SAMPLE_STORIES[3] },
    { city: 'Jaffa', ...SAMPLE_STORIES[4] },
  ];

  for (const s of storyAssignments) {
    const city = cityMap[s.city];
    if (!city) continue;

    const existing = await prisma.story.findFirst({
      where: { title: s.title, cityId: city.id },
    });

    if (!existing) {
      await prisma.story.create({
        data: {
          title: s.title,
          description: s.description,
          category: s.category,
          images: [`https://picsum.photos/seed/${s.title.replace(/\s/g, '')}/800/600`],
          cityId: city.id,
          latitude: city.latitude + (Math.random() - 0.5) * 0.02,
          longitude: city.longitude + (Math.random() - 0.5) * 0.02,
          userId: demoUser.id,
          viewCount: Math.floor(Math.random() * 100) + 10,
          likeCount: Math.floor(Math.random() * 30) + 2,
        },
      });
      await prisma.city.update({
        where: { id: city.id },
        data: { storyCount: { increment: 1 } },
      });
    }
  }

  // Extra stories for trending cities
  for (const cityName of ['Jerusalem', 'Ramallah', 'Gaza']) {
    const city = cityMap[cityName];
    if (!city) continue;
    for (let i = 0; i < 4; i++) {
      await prisma.story.create({
        data: {
          title: `Memory from ${city.name} #${i + 1}`,
          description: `A cherished moment shared from the streets of ${city.name}. Every corner holds a story waiting to be told.`,
          category: 'MEMORY',
          images: [`https://picsum.photos/seed/${city.name}${i}/800/600`],
          cityId: city.id,
          latitude: city.latitude,
          longitude: city.longitude,
          userId: demoUser.id,
          viewCount: 50 + i * 20,
          likeCount: 10 + i * 5,
        },
      });
      await prisma.city.update({
        where: { id: city.id },
        data: { storyCount: { increment: 1 } },
      });
    }
  }

  console.log('Seed complete!');
  console.log('Demo login: demo@baladverse.com / demo1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
