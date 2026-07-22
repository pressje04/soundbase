import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeMusicName, upsertCatalogSearchResults } from '@/lib/musicCatalog';

let cachedToken: { value: string; expiresAt: number } | null = null;
const searchCache = new Map<string, { data: unknown; expiresAt: number }>();

async function getSpotifyToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(`Spotify token request failed (${tokenRes.status})`);
  }

  cachedToken = {
    value: tokenData.access_token,
    expiresAt: Date.now() + (tokenData.expires_in ?? 3600) * 1000 - 60_000,
  };
  return cachedToken.value;
}

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  const normalizedQuery = typeof query === 'string' ? query.trim() : '';
  if (!normalizedQuery) return NextResponse.json({ error: 'Enter a search term' }, { status: 400 });

  const catalogQuery = normalizeMusicName(normalizedQuery);
  const [catalogAlbums, catalogArtists] = await Promise.all([
    prisma.album.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery, mode: 'insensitive' } },
          { normalizedName: { contains: catalogQuery } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
    prisma.artist.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery, mode: 'insensitive' } },
          { normalizedName: { contains: catalogQuery } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
  ]);

  if (catalogAlbums.length || catalogArtists.length) {
    return NextResponse.json({
      albums: {
        items: catalogAlbums.map((album) => ({
          id: album.id,
          name: album.name,
          images: album.imageUrl ? [{ url: album.imageUrl }] : [],
          artists: [{ id: album.artistId, name: album.artistName }],
          explicit: album.explicit,
          release_date: album.releaseDate,
        })),
      },
      artists: {
        items: catalogArtists.map((artist) => ({
          id: artist.id,
          name: artist.name,
          images: artist.imageUrl ? [{ url: artist.imageUrl }] : [],
          genres: artist.genres,
        })),
      },
      source: 'catalog',
    });
  }

  const cached = searchCache.get(normalizedQuery.toLowerCase());
  if (cached && cached.expiresAt > Date.now()) return NextResponse.json(cached.data);

  try {
    const accessToken = await getSpotifyToken();
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(normalizedQuery)}&type=album,artist&limit=10`,
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
    );

    if (res.status === 429) {
      const retryAfter = res.headers.get('retry-after') ?? '5';
      return NextResponse.json(
        { error: 'Spotify is rate-limiting searches. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': retryAfter } }
      );
    }
    if (!res.ok) {
      console.error('Spotify search failed:', res.status, await res.text());
      return NextResponse.json({ error: 'Spotify search is temporarily unavailable' }, { status: 502 });
    }

    const data = await res.json();
    await upsertCatalogSearchResults(data);
    searchCache.set(normalizedQuery.toLowerCase(), { data, expiresAt: Date.now() + 60_000 });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Spotify search failed:', error);
    return NextResponse.json({ error: 'Spotify search is temporarily unavailable' }, { status: 502 });
  }
}
