import Navbar from '@/components/navbar';
import AlbumPageClient from '@/components/AlbumPageClient';

interface Params {
  params: {id: string};
}
export default async function AlbumPage({ params }: Params) {
  // eslint-disable-next-line @next/next/no-sync-params
  const { id } = params;

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
  const access_token = tokenData.access_token;

  if (!access_token) {
    throw new Error('Failed to retrieve Spotify token');
  }

  const albumRes = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!albumRes.ok) {
    throw new Error('Failed to load album. Try again later.');
  }

  const album = await albumRes.json();

  await Promise.all(
    album.artists.map(async (artist: any) => {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/artist/ensure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: artist.id, name: artist.name }),
      });
    })
  );

  const sharedProps = {
    albumId: album.id,
    albumName: album.name,
    artistName: album.artists.map((a: any) => a.name).join(', '),
    releaseYear: album.release_date.slice(0, 4),
    imageUrl: album.images?.[0]?.url ?? '',
    tracklist: album.tracks.items,
  };

  return (
    <>
      <Navbar />
      <div className="mt-24 max-w-4xl mx-auto text-white px-6 py-8">
        <AlbumPageClient {...sharedProps} />
      </div>
    </>
  );
}
