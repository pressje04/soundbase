import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(req: Request) {
  const { artistId } = await req.json();
  const user = await getCurrentUser();

  if (!user || !artistId) {
    return NextResponse.json(
      { error: 'Unauthorized or missing artistId' },
      { status: 400 }
    );
  }

  try {
    await prisma.artistFollow.delete({
      where: {
        userId_artistId: {
          userId: (user as any).id,
          artistId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unfollow error:', err);
    return NextResponse.json(
      { error: 'Not following or internal error' },
      { status: 500 }
    );
  }
}
