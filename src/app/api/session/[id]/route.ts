import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await prisma.listeningSession.findUnique({
    where: { id: params.id },
    include: { host: true },
  });

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  if (session.hostId !== user.id) {
    const isFollowing = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: session.hostId,
        },
      },
    });

    if (!isFollowing) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
  }

  return NextResponse.json({ session });
}
