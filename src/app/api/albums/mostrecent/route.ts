import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Step 1: Fetch the 10 most recently reviewed unique albums
    const recentReviews = await prisma.post.findMany({
      where: {
        isReview: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Fetch more to filter down unique albums
    });

    // Step 2: Reduce to unique albums by albumId
    const seen = new Set();
    const uniqueAlbums = [];

    for (const review of recentReviews) {
      if (!seen.has(review.albumId)) {
        seen.add(review.albumId);
        uniqueAlbums.push({
          albumId: review.albumId,
          albumName: review.albumName,
          artistName: review.artistName,
          imageUrl: review.imageUrl,
        });
      }
      if (uniqueAlbums.length === 10) break;
    }

    return NextResponse.json(uniqueAlbums);
  } catch (error) {
    console.error('Error fetching recently reviewed albums:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
