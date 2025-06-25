import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const postId = params.id;

  const existing = await prisma.repost.findUnique({
    where: {
      userId_postId: { userId: user.id, postId }
    }
  });

  if (existing) {
    await prisma.repost.delete({ where: { userId_postId: { userId: user.id, postId } } });
    return NextResponse.json({ reposted: false });
  } else {
    await prisma.repost.create({ data: { userId: user.id, postId } });
    return NextResponse.json({ reposted: true });
  }
}
