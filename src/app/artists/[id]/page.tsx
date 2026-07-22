// app/artists/[id]/page.tsx
import Image from 'next/image';
import Navbar from '@/components/navbar';
import AlbumScroll from '@/components/albumscroll';
import ArtistFollowClientWrap from '@/components/ArtistFollowClientWrap';
import { upsertCatalogArtist } from '@/lib/musicCatalog';

type Album = {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { id?: string; name: string }[];
  explicit?: boolean;
  release_date?: string;
};

type Artist = {
  id: string;
  name: string;
  genres?: string[];
  images: { url: string }[];
};

function albumIdentity(album: Album) {
  // Spotify often lists the same album twice as "Album" and "Album (Clean)".
  // Treat those version labels as the same release, then choose the explicit copy below.
  const normalizedTitle = album.name
    .toLowerCase()
    .replace(/\s*[\[(](?:clean|explicit)(?:\s+version)?[\])]\s*/gi, ' ')
    .replace(/\s*-\s*(?:clean|explicit)(?:\s+version)?\s*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const artists = album.artists.map((artist) => artist.id ?? artist.name.toLowerCase()).join(',');

  return `${normalizedTitle}::${artists}`;
}

function isCleanVersion(album: Album) {
  return /(?:\b|[\[(])clean(?:\s+version)?(?:\b|[\])])/i.test(album.name);
}

function preferredAlbum(existing: Album, candidate: Album) {
  const existingIsClean = isCleanVersion(existing);
  const candidateIsClean = isCleanVersion(candidate);

  if (existingIsClean !== candidateIsClean) return existingIsClean ? candidate : existing;
  if (Boolean(existing.explicit) !== Boolean(candidate.explicit)) {
    return candidate.explicit ? candidate : existing;
  }

  // If Spotify returns multiple otherwise-identical releases, retain the earliest release.
  return (candidate.release_date ?? '') < (existing.release_date ?? '') ? candidate : existing;
}

/* Takes in the artist's id to render the page conditioned on that */
export default async function ArtistPage({ params }: { params: { id: string } }) {
  const artistId = params.id;

  // 🔐 Get Spotify token
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // 🎤 Get artist details
  const artistRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!artistRes.ok) {
    return <div className="text-red-500 text-center p-6">Failed to fetch artist info.</div>;
  }

  const artist: Artist = await artistRes.json();
  await upsertCatalogArtist(artist);

  // 💿 Get artist albums
  // Spotify now limits this endpoint to 10 albums per page, so load up to five pages.
  const artistAlbums: Album[] = [];
  for (let offset = 0; offset < 50; offset += 10) {
    const albumsRes = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=10&offset=${offset}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!albumsRes.ok) {
      console.error(`Failed to fetch artist albums at offset ${offset}:`, albumsRes.status);
      break;
    }

    const albumsData = await albumsRes.json();
    const pageItems = (albumsData.items ?? []) as Album[];
    artistAlbums.push(...pageItems);
    if (pageItems.length < 10) break;
  }

  if (artistAlbums.length === 0) {
    return <div className="text-red-500 text-center p-6">Failed to fetch albums.</div>;
  }

  const albumsByIdentity = new Map<string, Album>();
  for (const album of artistAlbums) {
    const identity = albumIdentity(album);
    const existing = albumsByIdentity.get(identity);
    albumsByIdentity.set(identity, existing ? preferredAlbum(existing, album) : album);
  }
  const dedupedAlbums = Array.from(albumsByIdentity.values()).map(({ id, name, images }) => ({
    id,
    name,
    images,
  }));
  const artistImage = artist.images?.[0]?.url;


  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#050505] pb-20 pt-24 text-white">
        <section className="relative mx-auto max-w-6xl overflow-hidden border-y border-white/10 sm:rounded-3xl sm:border">
          {artistImage && (
            <Image
              src={artistImage}
              alt=""
              fill
              priority
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="scale-110 object-cover opacity-35 blur-2xl"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.97)_0%,rgba(5,5,5,0.8)_48%,rgba(5,5,5,0.45)_100%)]" />
          <div className="relative flex min-h-[340px] items-end px-6 py-10 sm:min-h-[390px] sm:px-10 lg:px-14">
            <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-5 sm:gap-7">
                {artistImage ? (
                  <Image
                    src={artistImage}
                    alt={artist.name}
                    width={144}
                    height={144}
                    className="h-28 w-28 rounded-full border-2 border-white/30 object-cover shadow-2xl sm:h-36 sm:w-36"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-4xl font-bold sm:h-36 sm:w-36 sm:text-5xl">
                    {artist.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="pb-1">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">Artist</p>
                  <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{artist.name}</h1>
                  {artist.genres && artist.genres.length > 0 && (
                    <p className="mt-2 text-sm uppercase tracking-[0.12em] text-zinc-300">
                      {artist.genres.slice(0, 3).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
              <ArtistFollowClientWrap artistId={artistId} />
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-6xl px-6 sm:px-10 lg:px-14">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">Discography</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Albums</h2>
          <p className="mt-2 text-zinc-400">Explore {artist.name}&apos;s full-length releases.</p>
          {dedupedAlbums.length > 0 ? (
            <div className="mt-4 -mx-4">
              <AlbumScroll albums={dedupedAlbums} />
            </div>
          ) : (
            <p className="mt-6 text-gray-400">No albums found.</p>
          )}
        </section>
      </main>
    </>
  );
}
