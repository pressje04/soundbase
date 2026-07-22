import { prisma } from '@/lib/prisma';
import { upsertCatalogAlbum, type SpotifyAlbum } from '@/lib/musicCatalog';
import { getPopularAlbumsThisYear } from '@/lib/spotifyAlbums';

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
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
  if (entries.length < POPULAR_ALBUM_COUNT) return false;
  const newestUpdate = Math.max(...entries.map((entry) => entry.updatedAt.getTime()));
  return Date.now() - newestUpdate < CACHE_TTL_MS;
}

async function refreshPopularAlbums(year: number) {
  const fetched = (await getPopularAlbumsThisYear()) as SpotifyAlbum[];
  const cataloged = [] as Array<{ id: string }>;

  for (const album of fetched.slice(0, POPULAR_ALBUM_COUNT)) {
    const savedAlbum = await upsertCatalogAlbum(album);
    if (savedAlbum) cataloged.push({ id: savedAlbum.id });
  }

  if (cataloged.length < POPULAR_ALBUM_COUNT) {
    throw new Error(`Spotify returned only ${cataloged.length} valid popular albums`);
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
    throw error;
  }
}
