import { NextRequest, NextResponse } from 'next/server';
import { upsertCatalogAlbum } from '@/lib/musicCatalog';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[A-Za-z0-9]{22}$/.test(id)) {
    return NextResponse.json({ error: 'Invalid Spotify album ID' }, { status: 400 });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Spotify is not configured' }, { status: 500 });
  }

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(`Spotify token request failed (${tokenResponse.status})`);
    }

    const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      next: { revalidate: 3600 },
    });
    const album = await albumResponse.json();
    if (!albumResponse.ok) {
      throw new Error(`Spotify album request failed (${albumResponse.status})`);
    }
    await upsertCatalogAlbum(album);

    return NextResponse.json({
      imageUrl: album.images?.[0]?.url ?? '',
      tracks: album.tracks?.items?.map((track: { id: string; name: string }) => ({
        id: track.id,
        name: track.name,
      })) ?? [],
    });
  } catch (error) {
    console.error(`Failed to fetch Spotify album ${id}:`, error);
    return NextResponse.json({ error: 'Could not load album tracks' }, { status: 502 });
  }
}
