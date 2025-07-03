import { NextRequest, NextResponse } from "next/server";
import {prisma} from 'src/lib/prisma';
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, {params}: {params: {id: string}}) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const sessionId = params.id;
    const body = await req.json();
    const {userId} = body;

    if (!userId) {
        return NextResponse.json({error: 'Missing userId'}, {status: 400});
    }

    const session = await prisma.listeningSession.findUnique({
        where: {id: sessionId},
    });

    if (!session) {
        return NextResponse.json({error: 'Session does not exist/not found'}, {status: 404});
    }

    //Gotta see if user has been invited already, if so no need to send an invite again
    const existing = await prisma.sessionParticipant.findFirst({
        where: {sessionId, userId},
    });

    if (existing) {
        return NextResponse.json({error: 'User already invitied to session'}, {status: 400});
    }

    //Passes the checks, so we can send a new invite
    await prisma.sessionParticipant.create({
        data: {
            sessionId,
            userId,
            hasJoined: false,
        },
    });

    return NextResponse.json({success: true});
}