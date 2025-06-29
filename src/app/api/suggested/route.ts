import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = currentUser.id;

  // Step 1: Get people the current user follows
  const followings = await prisma.follows.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });

  const followingIds = followings.map(f => f.followingId);

  if (followingIds.length === 0) {
    return NextResponse.json([]); // No followings = no suggestions
  }

  // Step 2: Get who *they* follow
  const mutuals = await prisma.follows.findMany({
    where: {
      followerId: { in: followingIds },
      followingId: {
        notIn: [...followingIds, userId] // Exclude already followed and self
      }
    },
    select: {
      followingId: true,
    }
  });

  // Step 3: Count how often each user appears
  const counts: Record<string, number> = {};
  mutuals.forEach(({ followingId }) => {
    counts[followingId] = (counts[followingId] || 0) + 1;
  });

  // Step 4: Sort by most mutuals and fetch user data
  const sortedSuggestions = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const suggestedUserIds = sortedSuggestions.map(([id]) => id);

  const suggestedUsers = await prisma.user.findMany({
    where: { id: { in: suggestedUserIds } },
    select: {
      id: true,
      username: true,
      firstName: true,
      image: true,
    },
  });

  return NextResponse.json(suggestedUsers);
}
