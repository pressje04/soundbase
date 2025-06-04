import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const origin = req.nextUrl.origin;

  const tokenRes = await fetch(`${origin}/api/token`);
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  const spotifyRes = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=album`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await spotifyRes.json();
  return NextResponse.json({ albums: data.albums?.items || [] });
}

