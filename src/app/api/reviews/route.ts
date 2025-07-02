// POST /api/review
/* This route is used to create a review object in the database from the Review model
triggered whenever a user submits a review
*/
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { rating, text, albumId, albumName, artistName, releaseYear, imageUrl } = await req.json();
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const review = await prisma.review.create({
      data: {
        rating,
        comment: text,
        albumId,
        albumName,
        artistName,
        releaseYear,
        imageUrl,
        userId,
      },
    });

    return NextResponse.json(review);
  } catch (err) {
    console.error('Failed to create review:', err);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const albumId = req.nextUrl.searchParams.get('albumId');

  if (!albumId) {
    return NextResponse.json({ error: 'Missing albumId' }, { status: 400 });
  }

  try {
    const reviews = await prisma.post.findMany({
      where: {
        albumId,
        isReview: true,
        rating: {
          not: null,
        },
      },
      include: {
        user: {
          include: {
            tags: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
