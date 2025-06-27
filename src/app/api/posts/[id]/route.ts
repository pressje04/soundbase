import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth'; // or wherever your auth helper lives

const prisma = new PrismaClient();

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    const post = await prisma.post.findUnique({ where: { id: params.id } });
  
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
  
    if (post.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  
    try {
      // 1. Delete related likes
      await prisma.like.deleteMany({ where: { postId: params.id } });
  
      // 2. Delete related reposts
      await prisma.repost.deleteMany({ where: { postId: params.id } });
  
      // 3. Delete replies (child posts)
      await prisma.post.deleteMany({ where: { parentId: params.id } });
  
      // 4. Finally, delete the post
      await prisma.post.delete({ where: { id: params.id } });
  
      return NextResponse.json({ message: 'Post deleted' }, { status: 200 });
    } catch (err) {
      console.error('[DELETE /api/posts/[id]] error', err);
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
  }

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: params.id },
        include: {
          user: true,
          likes: true,
          reposts: true,
          replies: {
            include: { user: true },
          },
          _count: {
            select: {
              likes: true,
              reposts: true,
              replies: true,
            },
          },
        },
      });
  
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
  
      return NextResponse.json(post);
    } catch (err) {
      console.error('[GET /api/posts/[id]] error', err);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  }
  