import {NextResponse, NextRequest} from 'next/server';

export async function POST(req: NextRequest) {
    const origin = req.headers.get('origin') || '/';
    const res = NextResponse.redirect(origin, { status: 303 }); // Changes to GET
    res.cookies.set('token', '', { httpOnly: true, maxAge: 0, path: '/' });
    return res;
  }
  
  export async function GET(req: NextRequest) {
    const origin = req.headers.get('origin') || '/';
    return NextResponse.redirect(origin, { status: 303 });
  }
  