import { getCurrentUser } from '@/lib/auth';
import {PrismaClient} from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function DELETE(
    req: Request, 
    {params}: {params: {id: string}}
) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({error: 'Unauthorized to view this session'}, {status: 401});
    const session = await prisma.listeningSession.findUnique({
        where: {id: params.id},
    });
    if (!session) return NextResponse.json({error: 'Session not found'}, {status:404});
    if (session.hostId != user.id) return NextResponse.json({error: 'Forbidden'}, {status: 403});

    await prisma.listeningSession.update({
        where: {id: params.id},
        data: {isLive: false},
    });
    return NextResponse.json({success: true});
}