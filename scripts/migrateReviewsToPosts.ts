import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateReviews() {
  const reviews = await prisma.review.findMany();

  for (const r of reviews) {
    await prisma.post.create({
      data: {
        userId: r.userId,
        albumId: r.albumId,
        albumName: r.albumName,
        artistName: r.artistName,
        imageUrl: r.imageUrl,
        rating: r.rating,
        comment: r.comment,
        isReview: true,
        createdAt: r.createdAt,
      },
    });
  }

  console.log(`✅ Migrated ${reviews.length} reviews to posts`);
}

migrateReviews()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect());
