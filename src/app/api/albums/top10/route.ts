/* API route to help fetch the top 10 highest rated albums currently on Soundbase*/

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const topAlbums = await prisma.post.groupBy({
      by: ['albumId', 'albumName', 'imageUrl'],
      where: {
        isReview: true,
        rating: {
          not: null,
        },
      },
      _avg: {
        rating: true,
      },
      orderBy: {
        _avg: {
          rating: 'desc',
        },
      },
      take: 10,
    });

    return NextResponse.json(topAlbums);
  } catch (error) {
    console.error('Failed to fetch top albums: ', error);
    return NextResponse.json([], { status: 500 });
  }
}
