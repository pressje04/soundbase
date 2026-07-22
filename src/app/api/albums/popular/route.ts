import { NextResponse } from 'next/server';
import { getCachedPopularAlbumsThisYear } from '@/lib/popularAlbums';

// The database cache is the source of truth. Keep this route dynamic so Next
// does not try to contact Supabase while pre-rendering the application.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const albums = await getCachedPopularAlbumsThisYear();
    return NextResponse.json(albums, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to fetch popular albums this year:', error);
    return NextResponse.json({ error: 'Popular albums are unavailable' }, { status: 502 });
  }
}
