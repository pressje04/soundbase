import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, context: any) {
  const params = await Promise.resolve(context.params); // ✅ Ensure awaited
  const postId = params.id;

  if (!postId) {
    return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  return NextResponse.json({ success: true });
}
