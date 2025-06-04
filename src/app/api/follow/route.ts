/*This is the API route for following/unfollowing users
The POST request is for following users/establishing connection 
and obviously the DELETE request is for unfollowing */

import {NextRequest, NextResponse} from 'next/server';
import {PrismaClient} from '@prisma/client';

export async function POST(req: NextRequest) {
    const prisma = new PrismaClient();
    const {followerId, followingId} = await req.json();

    //Can't follow ourselves, make sure fields are present and they aren't the same
    if (!followerId || !followingId || followerId === followingId) {
        return NextResponse.json({error: 'Invalid input'}, {status: 400});
    }

    try {
        await prisma.follows.create({data: {followerId, followingId}});
        return NextResponse.json({message: 'You have followed this user'});
    } catch (err: any) {
        if (err.code === 'P2002') {
            return NextResponse.json({error: 'Already following this user'}, {status: 409});
        }
        //Obscure error if it hasn't been caught yet
        console.error(err);
        return NextResponse.json({error: 'Internal server error'}, {status: 500});
    }
}

export async function DELETE(req: NextRequest) {
    const prisma = new PrismaClient();
    const {followerId, followingId} = await req.json();

    if (!followerId || !followingId) {
        return NextResponse.json({error: 'Invalid request to unfollow'}, {status: 400});
    }
    
    try {
        await prisma.follows.delete({where : {
            followerId_followingId: {
                followerId, 
                followingId,
            },
        }});
        return NextResponse.json({message: 'Unfollowed user successfully'});
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({error: 'Failed to unfollow'}, {status: 500});
    }
}