import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function clearAuthCookies(response: NextResponse) {
  response.cookies.set('spotify_code_verifier', '', { path: '/', maxAge: 0 });
  response.cookies.set('spotify_auth_state', '', { path: '/', maxAge: 0 });
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const verifier = request.cookies.get('spotify_code_verifier')?.value;
  const expectedState = request.cookies.get('spotify_auth_state')?.value;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

  if (!code || !state || !verifier || !expectedState || !clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'Spotify authorization could not be verified' }, { status: 400 });
  }

  const stateMatches =
    state.length === expectedState.length &&
    crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expectedState));
  if (!stateMatches) {
    return NextResponse.json({ error: 'Invalid Spotify authorization state' }, { status: 400 });
  }

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
      cache: 'no-store',
    });
    const data = await tokenRes.json();

    if (!tokenRes.ok || !data.access_token) {
      console.error('Spotify token exchange failed:', tokenRes.status, data.error);
      return NextResponse.json({ error: 'Spotify token exchange failed' }, { status: 502 });
    }

    const response = NextResponse.json({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    });
    clearAuthCookies(response);
    return response;
  } catch (error) {
    console.error('Spotify token exchange failed:', error);
    return NextResponse.json({ error: 'Spotify token exchange failed' }, { status: 502 });
  }
}
