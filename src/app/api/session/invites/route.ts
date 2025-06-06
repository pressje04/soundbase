import {NextResponse} from 'next/server';
import {PrismaClient} from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
    const user = await getCurrentUser();
    //If not curr user, should have no invites 
    if (!user) {
        return NextResponse.json({invites: []});
    }

    const invites = await prisma.sessionParticipant.findMany({
        where: {
            userId: user.id,
            hasJoined: false,
            session: {
                isLive: true,
            }
        },
        include: {
            session: {
                include: {host: true},
            }
        }
    });
    return NextResponse.json({invites});
}
