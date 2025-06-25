import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { albumId, albumName, artistName, imageUrl, rating, comment, isReview, parentId } = await req.json();

  if (!albumId || !comment) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (isReview && parentId) {
    return NextResponse.json({ error: 'Reviews cannot be replies' }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId: user.id,
      albumId,
      albumName,
      artistName,
      imageUrl,
      rating,
      comment,
      isReview,
      parentId: parentId ?? null,
    },
  });

  return NextResponse.json(post);
}
