// app/api/user/albums-reviewed/route.ts
import { getCurrentUser } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const albums = await prisma.review.findMany({
    where: { userId: user.id },
    distinct: ['albumId'],
    select: {
      albumId: true,
      albumName: true,
      artistName: true,
      imageUrl: true,
    },
  });

  return NextResponse.json({ albums });
}
