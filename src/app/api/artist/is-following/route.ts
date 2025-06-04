// app/api/artist/is-following/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const artistId = searchParams.get('id');
  const user = await getCurrentUser();

  if (!user || !artistId) {
    return NextResponse.json({ following: false });
  }

  const prisma = new PrismaClient();

  const follow = await prisma.artistFollow.findUnique({
    where: {
      userId_artistId: {
        userId: (user as any).id,
        artistId,
      },
    },
  });

  return NextResponse.json({ isFollowing: !!follow });
}
