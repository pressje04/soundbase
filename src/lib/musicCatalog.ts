import { prisma } from '@/lib/prisma';

type SpotifyArtist = {
  id: string;
  name: string;
  images?: Array<{ url?: string }>;
  genres?: string[];
};

type SpotifyTrack = {
  id: string;
  name: string;
  track_number?: number;
  duration_ms?: number;
  artists?: Array<{ name: string }>;
};

export type SpotifyAlbum = {
  id: string;
  name: string;
  images?: Array<{ url?: string }>;
  artists?: SpotifyArtist[];
  release_date?: string;
  explicit?: boolean;
  album_type?: string;
  total_tracks?: number;
  tracks?: { items?: SpotifyTrack[] };
};

export function normalizeMusicName(value: string) {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export async function upsertCatalogArtist(artist: SpotifyArtist) {
  if (!artist?.id || !artist.name) return null;

  const imageUrl = artist.images?.[0]?.url;
  const genres = artist.genres;
  return prisma.artist.upsert({
    where: { id: artist.id },
    create: {
      id: artist.id,
      name: artist.name,
      normalizedName: normalizeMusicName(artist.name),
      imageUrl,
      genres: genres ?? [],
    },
    update: {
      name: artist.name,
      normalizedName: normalizeMusicName(artist.name),
      ...(imageUrl ? { imageUrl } : {}),
      ...(genres ? { genres } : {}),
    },
  });
}

export async function upsertCatalogAlbum(album: SpotifyAlbum) {
  const primaryArtist = album.artists?.[0];
  if (!album?.id || !album.name || !primaryArtist) return null;

  await upsertCatalogArtist(primaryArtist);
  const imageUrl = album.images?.[0]?.url;
  const savedAlbum = await prisma.album.upsert({
    where: { id: album.id },
    create: {
      id: album.id,
      name: album.name,
      normalizedName: normalizeMusicName(album.name),
      artistId: primaryArtist.id,
      artistName: primaryArtist.name,
      imageUrl,
      releaseDate: album.release_date,
      explicit: Boolean(album.explicit),
      albumType: album.album_type,
      totalTracks: album.total_tracks,
    },
    update: {
      name: album.name,
      normalizedName: normalizeMusicName(album.name),
      artistId: primaryArtist.id,
      artistName: primaryArtist.name,
      ...(imageUrl ? { imageUrl } : {}),
      releaseDate: album.release_date,
      explicit: Boolean(album.explicit),
      albumType: album.album_type,
      totalTracks: album.total_tracks,
    },
  });

  if (album.tracks?.items?.length) {
    for (const track of album.tracks.items) {
      await prisma.track.upsert({
        where: { id: track.id },
        create: {
          id: track.id,
          name: track.name,
          trackNumber: track.track_number,
          durationMs: track.duration_ms,
          artistName: track.artists?.map((artist) => artist.name).join(', '),
          albumId: savedAlbum.id,
        },
        update: {
          name: track.name,
          trackNumber: track.track_number,
          durationMs: track.duration_ms,
          artistName: track.artists?.map((artist) => artist.name).join(', '),
          albumId: savedAlbum.id,
        },
      });
    }
  }

  return savedAlbum;
}

export async function upsertCatalogSearchResults(data: {
  albums?: { items?: SpotifyAlbum[] };
  artists?: { items?: SpotifyArtist[] };
}) {
  for (const artist of data.artists?.items ?? []) await upsertCatalogArtist(artist);
  for (const album of data.albums?.items ?? []) await upsertCatalogAlbum(album);
}
