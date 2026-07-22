import { NextRequest, NextResponse } from 'next/server';
import { refreshSpotifyUserToken } from '@/lib/spotifyUserToken';

type PlayRequest = {
  deviceId?: string;
  albumId?: string;
  trackUri?: string;
};

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: 'Spotify connection has expired. Please reconnect.' }, { status: 401 });
  }

  const body = (await request.json()) as PlayRequest;
  if (!body.deviceId || !body.albumId) {
    return NextResponse.json({ error: 'Missing Spotify playback details' }, { status: 400 });
  }

  try {
    const { accessToken } = await refreshSpotifyUserToken(refreshToken);
    const playbackBody: Record<string, unknown> = {
      context_uri: `spotify:album:${body.albumId}`,
    };
    if (body.trackUri) playbackBody.offset = { uri: body.trackUri };

    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(body.deviceId)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playbackBody),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error('Spotify playback request failed:', response.status, detail);
      return NextResponse.json({ error: 'Spotify could not start playback' }, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Spotify playback request failed:', error);
    return NextResponse.json({ error: 'Spotify playback failed' }, { status: 502 });
  }
}
