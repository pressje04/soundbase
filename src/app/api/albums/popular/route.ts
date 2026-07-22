import { NextResponse } from 'next/server';
import { getPopularAlbumsThisYear } from '@/lib/spotifyAlbums';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getPopularAlbumsThisYear());
  } catch (error) {
    console.error('Failed to fetch popular albums this year:', error);
    return NextResponse.json({ error: 'Popular albums are unavailable' }, { status: 502 });
  }
}
