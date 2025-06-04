// app/artists/[id]/page.tsx
import Image from 'next/image';
import Navbar from '@/components/navbar';
import Link from 'next/link';
import AlbumScroll from '@/components/albumscroll';
import dynamic from 'next/dynamic';
import ArtistFollowClientWrapper from '@/components/ArtistFollowClientWrap';
import ArtistFollowClientWrap from '@/components/ArtistFollowClientWrap';

type Album = {
  id: string;
  name: string;
  images: { url: string }[];
};

type Artist = {
  name: string;
  genres: string[];
  followers: { total: number };
  images: { url: string }[];
};

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

  // 💿 Get artist albums
  const albumsRes = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=50`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!albumsRes.ok) {
    return <div className="text-red-500 text-center p-6">Failed to fetch albums.</div>;
  }

  const albumsData = await albumsRes.json();

  // ✅ Deduplicate albums
  const dedupedAlbums: Album[] = Array.from(
    new Map(
      (albumsData.items as Album[]).map((album: any) => [
        `${album.name}-${album.artists.map((a: any) => a.name).join(',')}`,
        {
          id: album.id,
          name: album.name,
          images: album.images,
        } satisfies Album,
      ])
    ).values()
  );

  const albumIds = dedupedAlbums.map((album: any) => album.id).slice(0, 20); // Limit to 20

  const popularRes = await fetch(
    `https://api.spotify.com/v1/albums?ids=${albumIds.join(',')}`,
     {
     headers: {
      Authorization: `Bearer ${accessToken}`,
     },
   }
  );

const popularData = await popularRes.json();
const albumsWithPopularity = popularData.albums;

const mostPopularAlbum = albumsWithPopularity.reduce((top: any, current: any) =>
  (current.popularity ?? 0) > (top.popularity ?? 0) ? current : top
);


  return (
    <>
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto text-white px-6">
        <div className="flex items-center gap-6 mb-10">
          {artist.images?.[0] && (
            <Image
              src={artist.images[0].url}
              alt={artist.name}
              width={160}
              height={160}
              className="rounded-full shadow"
            />
          )}
          <div>
            <h1 className="text-4xl font-bold">{artist.name}</h1>
            <p className="text-gray-400 text-sm uppercase tracking-wide">
              {artist.genres?.join(', ')}
            </p>
            <p className="text-gray-400 text-sm">
              {artist.followers.total.toLocaleString()} followers
            </p>
          </div>
          <ArtistFollowClientWrap artistId={artistId}/>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Albums</h2>

        {dedupedAlbums.length > 0 ? (
          <AlbumScroll albums={dedupedAlbums} />
        ) : (
          <p className="text-gray-400">No albums found.</p>
        )}
      </div>
      {mostPopularAlbum && (
  <div className="mt-10">
    <h2 className="text-2xl font-semibold mb-4">Most Popular Album</h2>
    <Link href={`/albums/${mostPopularAlbum.id}`}>
      <div className="flex items-center gap-6 p-4 rounded hover:bg-gray-700 transition">
        <Image
          src={mostPopularAlbum.images[0]?.url || ''}
          alt={mostPopularAlbum.name}
          width={160}
          height={160}
          className="rounded-xl"
        />
        <div>
          <h3 className="text-2xl font-bold">{mostPopularAlbum.name}</h3>
          <p className="text-sm text-gray-400">
            Released: {mostPopularAlbum.release_date?.slice(0, 4)}
          </p>
          <p className="text-sm text-gray-400">
            Popularity Score: {mostPopularAlbum.popularity}
          </p>
        </div>
      </div>
    </Link>
  </div>
)}

    </>
  );
}
