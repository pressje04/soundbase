/* API route for profile page that returns all posts and reposts

This essentially fetches what the 'POSTS' tab should display when it renders
*/
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from "@/lib/auth";

export async function GET(_: NextRequest, {params}: {params: {id: string}}) {
    const userId = params.id;

    const authoredPosts = await prisma.post.findMany({
        where: {userId},
        include: {
            user: true,
            _count: {select: {likes: true, reposts: true, replies: true}}
        },
        orderBy: {createdAt: 'desc'}
    });

    const reposts = await prisma.repost.findMany({
      where: { userId },
      include: {
        user: true, // ✅ include the reposter (required for repostedBy)
        post: {
          include: {
            user: true, // original author of the post
            _count: { select: { likes: true, reposts: true, replies: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    

    const repostedPosts = reposts.map((r) => ({
      ...r.post,
      repostedBy: {
        id: r.user.id,
        username: r.user.username,
      },
    }));
    

    const all = [...authoredPosts, ...repostedPosts];
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    const body = await req.json();
    const { albumId, albumName, artistName, imageUrl, rating, comment, isReview, parentId } = body;
  
    if (!albumId || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
  
    if (isReview && parentId) {
      return NextResponse.json({ error: 'Reviews cannot be replies' }, { status: 400 });
    }
  
    try {
      const post = await prisma.post.create({
        data: {
          userId: user.id,
          albumId,
          albumName,
          artistName,
          imageUrl,
          rating,
          comment,
          isReview,
          parentId: parentId ?? null,
        },
        include: {
          user: true,
        },
      });
  
      return NextResponse.json(post);
    } catch (error) {
      console.error('[POST /api/posts/new] Error creating post:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

