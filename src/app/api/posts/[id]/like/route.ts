import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: postId } = context.params;

    const existing = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });

    if (existing) {
      await prisma.like.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({ liked: false });
    }

    await prisma.like.create({
      data: {
        userId: user.id,
        postId,
      },
    });

    return NextResponse.json({ liked: true });
  } catch (err) {
    console.error('[LIKE_ERROR]', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
