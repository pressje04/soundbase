import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id: userId } = context.params;

  const likes = await prisma.like.findMany({
    where: { userId },
    include: {
      post: {
        include: {
          user: true,
          _count: {
            select: {
              likes: true,
              replies: true,
              reposts: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Extract and return only posts
  const likedPosts = likes.map((like) => like.post);

  return NextResponse.json(likedPosts);
}
