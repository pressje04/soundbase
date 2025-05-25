// POST /api/review
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const albumId = searchParams.get('albumId');
  
    if (!albumId) {
      return NextResponse.json([], { status: 200 });
    }
  
    try {
      const reviews = await prisma.review.findMany({
        where: { albumId },
        orderBy: { createdAt: 'desc' },
        include: {user: true},
      });
  
      return NextResponse.json(reviews);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  }

export async function POST(req: NextRequest) {
  const { rating, text, albumId } = await req.json();
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
  const userId = decoded.userId;

  const review = await prisma.review.create({
    data: {
      rating,
      comment: text,
      albumId,
      userId,
    },
  });

  return NextResponse.json(review);
}
