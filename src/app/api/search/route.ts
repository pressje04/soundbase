import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const { access_token } = await tokenRes.json();

  const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album,artist&limit=10`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
