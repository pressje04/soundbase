import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { getRedirectTypeFromError } from "next/dist/client/components/redirect";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: {params: {id: string} }) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({error: 'Unauthorized'}, {status: 401});

    const postId = params.id;
    const existing = await prisma.like.findUnique({
        where: {
            userId_postId: {userId: user.id, postId}
        }
    });

    if (existing) {
        await prisma.like.delete({where: {userId_postId: {userId: user.id, postId}}});
        return NextResponse.json({liked: false})
    } else {
        await prisma.like.create({data: {userId: user.id, postId}});
        return NextResponse.json({liked: true});
    }

}