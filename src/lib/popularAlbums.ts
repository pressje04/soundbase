import { prisma } from '@/lib/prisma';
import { upsertCatalogAlbum, type SpotifyAlbum } from '@/lib/musicCatalog';
import { getPopularAlbumsThisYear } from '@/lib/spotifyAlbums';

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PARTIAL_CACHE_TTL_MS = 60 * 60 * 1000;
const POPULAR_ALBUM_COUNT = 15;

type CachedAlbum = {
  id: string;
  name: string;
  imageUrl: string | null;
  artistId: string;
  artistName: string;
  releaseDate: string | null;
  explicit: boolean;
  albumType: string | null;
};

function toCarouselAlbum(album: CachedAlbum) {
  return {
    id: album.id,
    name: album.name,
    imageUrl: album.imageUrl,
    artists: [{ id: album.artistId, name: album.artistName }],
    release_date: album.releaseDate,
    explicit: album.explicit,
    album_type: album.albumType,
  };
}

async function getCachedPopularAlbums(year: number) {
  return prisma.popularAlbum.findMany({
    where: { year },
    orderBy: { position: 'asc' },
    include: { album: true },
  });
}

function cacheIsFresh(entries: Awaited<ReturnType<typeof getCachedPopularAlbums>>) {
  if (!entries.length) return false;
  const newestUpdate = Math.max(...entries.map((entry) => entry.updatedAt.getTime()));
  const ttl = entries.length >= POPULAR_ALBUM_COUNT ? CACHE_TTL_MS : PARTIAL_CACHE_TTL_MS;
  return Date.now() - newestUpdate < ttl;
}

async function refreshPopularAlbums(year: number) {
  const fetched = (await getPopularAlbumsThisYear()) as SpotifyAlbum[];
  const cataloged = [] as Array<{ id: string }>;

  for (const album of fetched.slice(0, POPULAR_ALBUM_COUNT)) {
    const savedAlbum = await upsertCatalogAlbum(album);
    if (savedAlbum) cataloged.push({ id: savedAlbum.id });
  }

  if (!cataloged.length) {
    throw new Error('Spotify returned no valid popular albums');
  }

  await prisma.$transaction([
    prisma.popularAlbum.deleteMany({ where: { year } }),
    prisma.popularAlbum.createMany({
      data: cataloged.map((album, index) => ({
        year,
        albumId: album.id,
        position: index + 1,
      })),
    }),
  ]);

  return getCachedPopularAlbums(year);
}

async function seedFromCatalog(year: number) {
  const candidates = await prisma.album.findMany({
    where: {
      releaseDate: { startsWith: String(year) },
      OR: [{ albumType: 'album' }, { albumType: null }],
    },
    orderBy: { updatedAt: 'desc' },
    take: POPULAR_ALBUM_COUNT * 3,
  });
  const seen = new Set<string>();
  const albums = candidates.filter((album) => {
    const normalizedTitle = album.name
      .toLocaleLowerCase()
      .replace(/\s*\((?:clean|explicit)\)\s*/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const identity = `${normalizedTitle}::${album.artistId}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  }).slice(0, POPULAR_ALBUM_COUNT);

  if (!albums.length) return [];

  await prisma.$transaction([
    prisma.popularAlbum.deleteMany({ where: { year } }),
    prisma.popularAlbum.createMany({
      data: albums.map((album, index) => ({ year, albumId: album.id, position: index + 1 })),
    }),
  ]);

  return getCachedPopularAlbums(year);
}

export async function getCachedPopularAlbumsThisYear() {
  const year = new Date().getFullYear();
  const cached = await getCachedPopularAlbums(year);

  if (cacheIsFresh(cached)) {
    return cached.map(({ album }) => toCarouselAlbum(album));
  }

  try {
    const refreshed = await refreshPopularAlbums(year);
    return refreshed.map(({ album }) => toCarouselAlbum(album));
  } catch (error) {
    // A stale list is still far more useful than an empty carousel when Spotify
    // is temporarily rate-limited or unreachable.
    if (cached.length) {
      console.warn('Serving stale popular album cache after refresh failure:', error);
      return cached.map(({ album }) => toCarouselAlbum(album));
    }

    const catalogFallback = await seedFromCatalog(year);
    if (catalogFallback.length) {
      console.warn('Seeded popular album cache from the catalog after refresh failure:', error);
      return catalogFallback.map(({ album }) => toCarouselAlbum(album));
    }

    throw error;
  }
}
