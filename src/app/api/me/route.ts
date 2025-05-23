import {NextRequest, NextResponse} from 'next/server';
import jwt from 'jsonwebtoken';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.json({user: null}, {status:401});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {userId: string};
        const user = await prisma.user.findUnique({
            where: {id: decoded.userId},
            select: {id:true, firstName: true},
        });

        if (!user) {
            return NextResponse.json({user:null}, {status:404});
        }

        return NextResponse.json({user});
    } catch (err) {
        return NextResponse.json({user:null}, {status:401});
    }
}