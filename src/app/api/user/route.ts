import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // make sure this path is correct in your project

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  try {
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        followers: {
          include: {
            follower: true,
          },
        },
        following: {
          include: {
            following: true,
          },
        },
        reviews: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[GET /api/user] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
