import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const albumId = searchParams.get('albumId');

  if (!albumId) {
    return NextResponse.json({ error: 'Missing albumId' }, { status: 400 });
  }

  const posts = await prisma.post.findMany({
    where: { albumId, parentId: null },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      replies: {
        include: { user: true },
        orderBy: { createdAt: 'asc' }
      },
      _count: {
        select: { replies: true, likes: true, reposts: true },
      },
    },
  });

  return NextResponse.json(posts);
}
