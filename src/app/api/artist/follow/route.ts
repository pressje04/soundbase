import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth'; // ✅ import the server-side auth helper

export async function POST(req: Request) {
  const { artistId } = await req.json();
  const user = await getCurrentUser(); // ✅ use the decoded user from JWT

  if (!user || !artistId) {
    return NextResponse.json(
      { error: 'Unauthorized or missing artistId' },
      { status: 400 }
    );
  }

  const prisma = new PrismaClient();

  try {
    const follow = await prisma.artistFollow.create({
      data: {
        userId: user.id,
        artistId,
      },
    });

    return NextResponse.json(follow);
  } catch (err) {
    console.error('Follow error:', err);
    return NextResponse.json(
      { error: 'Already following or internal error' },
      { status: 500 }
    );
  }
}
