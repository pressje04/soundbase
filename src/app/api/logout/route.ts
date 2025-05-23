import {NextResponse, NextRequest} from 'next/server';

export async function POST(req: NextRequest) {
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const response = NextResponse.redirect(`${origin}`);

    response.cookies.set('token', '', {
        httpOnly: true,
        maxAge: 0,
        path: '/'
    });

    return response;
}