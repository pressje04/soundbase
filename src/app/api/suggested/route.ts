// /app/api/suggested/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    // Step 1: Get IDs of users the current user follows
    const following = await prisma.follows.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map(f => f.followingId);

    // Step 2: Find users followed by those followings (mutuals), excluding the user and their existing followings
    const mutuals = await prisma.follows.findMany({
      where: {
        followerId: { in: followingIds },
        followingId: {
          notIn: [userId, ...followingIds],
        },
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            firstName: true,
            image: true,
            followers: {
              where: { followerId: userId },
              select: { id: true },
            },
          },
        },
      },
    });

    // Deduplicate by user ID and format
    const uniqueMutualsMap = new Map();
    for (const m of mutuals) {
      const id = m.following.id;
      if (!uniqueMutualsMap.has(id)) {
        uniqueMutualsMap.set(id, {
          id,
          username: m.following.username,
          firstName: m.following.firstName,
          image: m.following.image,
          isFollowing: m.following.followers.length > 0,
        });
      }
    }

    const suggestions = Array.from(uniqueMutualsMap.values());

    // Step 3: If less than 10, fetch random users to fill the rest
    if (suggestions.length < 10) {
      const fillerCount = 10 - suggestions.length;
      const fillerUsers = await prisma.user.findMany({
        where: {
          id: {
            notIn: [userId, ...suggestions.map(u => u.id), ...followingIds],
          },
        },
        take: fillerCount,
        orderBy: { createdAt: 'desc' }, // or random if needed
        select: {
          id: true,
          username: true,
          firstName: true,
          image: true,
          followers: {
            where: { followerId: userId },
            select: { id: true },
          },
        },
      });

      const fillerFormatted = fillerUsers.map(u => ({
        id: u.id,
        username: u.username,
        firstName: u.firstName,
        image: u.image,
        isFollowing: u.followers.length > 0,
      }));

      suggestions.push(...fillerFormatted);
    }

    return NextResponse.json(suggestions.slice(0, 10));
  } catch (err) {
    console.error('Failed to fetch suggested users:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
