import Image from 'next/image';
import Navbar from '@/components/navbar';
import Link from 'next/link';

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

  const artist = await artistRes.json();

  // 💿 Get artist albums
  const albumsRes = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=50`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const albumsData = await albumsRes.json();

  const dedupedAlbums = Array.from(
    new Map(
      albumsData.items.map((album: any) => [
        `${album.name}-${album.artists.map((a: any) => a.name).join(',')}`,
        album,
      ])
    ).values()
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
            <p className="text-gray-400 text-sm uppercase tracking-wide">{artist.genres?.join(', ')}</p>
            <p className="text-gray-400 text-sm">{Math.round(artist.followers.total).toLocaleString()} followers</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Albums</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {dedupedAlbums.map((album: any) => (
            <Link href={`/albums/${album.id}`} key={album.id}>
              <div className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition">
                <Image
                  src={album.images?.[0]?.url || ''}
                  alt={album.name}
                  width={200}
                  height={200}
                  className="rounded"
                />
                <p className="mt-2 font-semibold">{album.name}</p>
                <p className="text-sm text-gray-400">{album.release_date?.slice(0, 4)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
