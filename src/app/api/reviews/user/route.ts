import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const reviews = await prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        albumId: true,
        albumName: true,
        rating: true,
        comment: true,
        createdAt: true,
        artistName: true,
        releaseYear: true,
        imageUrl: true,
        user: {
          select: {
            firstName: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(reviews);
  } catch (err) {
    console.error('Failed to decode token or fetch reviews:', err);
    return NextResponse.json([], { status: 200 });
  }
}
