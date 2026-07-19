import { NextResponse } from 'next/server';
import { getSpotifyFallbackAlbums } from '@/lib/spotifyAlbums';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getSpotifyFallbackAlbums());
  } catch (error) {
    console.error('Failed to fetch Spotify fallback albums:', error);
    return NextResponse.json({ error: 'Spotify albums are unavailable' }, { status: 502 });
  }
}
