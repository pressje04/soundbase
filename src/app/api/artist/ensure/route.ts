/* Route for inserting an artist into db ENSURING that
it doesn't exist already

Part of following artists logic
*/

import {NextResponse, NextRequest} from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const {id, name} = await req.json();

    if (!id || !name) {
        return NextResponse.json({error: 'Missing parameters: artist id or name'}, {status: 400});
    }

    try {
        await prisma.artist.upsert({
            where: {id},
            update: {},
            create: {
                id, 
                name,
            },
        });
        return NextResponse.json({message: 'artist ensured in DB'});
    } catch (error) {
        /*Pretty uncommon error if this is triggered, if this 
        happens go back and trace what's being passed*/
        console.error('[artist/ensure] error', error);
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
    }
}