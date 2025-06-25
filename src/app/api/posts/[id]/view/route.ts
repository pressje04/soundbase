import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const postId = params.id;

  await prisma.post.update({
    where: { id: postId },
    data: { views: { increment: 1 } }
  });

  return NextResponse.json({ success: true });
}
