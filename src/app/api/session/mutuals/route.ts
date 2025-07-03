import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const following = await prisma.follows.findMany({
    where: { followerId: user.id },
    select: { followingId: true },
  });

  const followers = await prisma.follows.findMany({
    where: { followingId: user.id },
    select: { followerId: true },
  });

  const followingIds = following.map(f => f.followingId);
  const followerIds = followers.map(f => f.followerId);

  const mutualIds = followingIds.filter(id => followerIds.includes(id));

  if (mutualIds.length === 0) {
    return NextResponse.json({ message: 'No mutual followers found' }, { status: 200 });
  }

  const mutuals = await prisma.user.findMany({
    where: { id: { in: mutualIds } },
    select: { id: true, firstName: true, username: true, image: true },
  });

  return NextResponse.json({ mutuals });
}
