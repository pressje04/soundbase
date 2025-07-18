// app/api/session/create/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await prisma.listeningSession.create({
    data: {
      hostId: user.id,
    },
  });

  await prisma.sessionParticipant.create({
    data: {
      sessionId: session.id,
      userId: user.id,
    },
  });

  return NextResponse.json({ session });
}
