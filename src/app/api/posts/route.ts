import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const albumId = searchParams.get('albumId');

  if (!albumId) {
    return NextResponse.json({ error: 'Missing albumId' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const currentUser = getCurrentUser();

  const posts = await prisma.post.findMany({
    where: { albumId, parentId: null },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      replies: {
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      },
      likes: currentUser
        ? {
            where: { userId: currentUser.id },
            select: { id: true },
          }
        : false,
      reposts: currentUser
        ? {
            where: { userId: currentUser.id },
            select: { id: true },
          }
        : false,
      _count: {
        select: { replies: true, likes: true, reposts: true },
      },
    },
  });

  // Add flags: likedByCurrentUser and repostedByCurrentUser
  const enrichedPosts = posts.map((post) => ({
    ...post,
    likedByCurrentUser: currentUser ? post.likes?.length > 0 : false,
    repostedByCurrentUser: currentUser ? post.reposts?.length > 0 : false,
  }));

  return NextResponse.json(enrichedPosts);
}
