import { NextRequest, NextResponse } from 'next/server';
import { refreshSpotifyUserToken } from '@/lib/spotifyUserToken';

const refreshCookieOptions = {
  path: '/',
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 180 * 24 * 60 * 60,
};

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: 'Spotify connection has expired. Please reconnect.' }, { status: 401 });
  }

  try {
    const token = await refreshSpotifyUserToken(refreshToken);
    const response = NextResponse.json({
      accessToken: token.accessToken,
      expiresIn: token.expiresIn,
    });

    if (token.refreshToken) response.cookies.set('spotify_refresh_token', token.refreshToken, refreshCookieOptions);
    return response;
  } catch (error) {
    console.error('Spotify token refresh failed:', error);
    return NextResponse.json({ error: 'Could not refresh Spotify connection' }, { status: 502 });
  }
}
