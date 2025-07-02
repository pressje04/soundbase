import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


export async function GET(req: NextRequest) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Find IDs of users the current user follows
  const following = await prisma.follows.findMany({
    where: { followerId: currentUser.id },
    select: { followingId: true },
  });

  const followingIds = following.map(f => f.followingId);

  // 2. Get posts from followed users
  const posts = await prisma.post.findMany({
    where: {
      userId: { in: followingIds },
      parentId: null, // top-level only
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        include: {
          tags: true,
        }
      },
      replies: { include: { user: true }, orderBy: { createdAt: 'asc' } },
      likes: currentUser
        ? { where: { userId: currentUser.id }, select: { id: true } }
        : false,
      reposts: currentUser
        ? { where: { userId: currentUser.id }, select: { id: true } }
        : false,
      _count: { select: { replies: true, likes: true, reposts: true } },
    },
  });

  const enriched = posts.map(post => ({
    ...post,
    likedByCurrentUser: currentUser ? post.likes?.length > 0 : false,
    repostedByCurrentUser: currentUser ? post.reposts?.length > 0 : false,
  }));

  return NextResponse.json(enriched);
}
