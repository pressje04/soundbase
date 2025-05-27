import Image from 'next/image';
import Navbar from '@/components/navbar';
import ScorePill from '@/components/ScorePill';
import ReviewForm from '@/components/ReviewForm';
import ReviewButton from '@/components/ReviewButton';
import Albumdash from '@/components/Albumdash';
import ReviewList from '@/components/ReviewList';
import Link from 'next/link';
import AlbumPlayerClient from '@/components/AlbumPlayerClient';

export default async function AlbumPage({
  params,
}: {
  params: { id: string };
}) {
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
    return (
      <div className="text-red-500 text-center p-6">
        Failed to retrieve Spotify token.
      </div>
    );
  }

  const albumRes = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!albumRes.ok) {
    return (
      <div className="text-red-500 text-center p-6">
        Failed to load album. Please try again later.
      </div>
    );
  }

  const album = await albumRes.json();

  return (
    <>
      <Navbar />

      <div className="mt-24 max-w-4xl mx-auto text-white px-6 py-8">
        {/* Album Header Section */}
        <div className="flex flex-col md:flex-row items-start gap-6">
          <Image
            src={album.images[0].url}
            alt={album.name}
            width={300}
            height={300}
            className="rounded-xl shadow-lg"
          />

          <div className="flex flex-col justify-between h-[300px] text-center md:text-left">
            <div>
              <p className="uppercase text-sm text-gray-400 tracking-wide">Album</p>
              <h1 className="text-4xl md:text-5xl font-extrabold mt-2">{album.name}</h1>
              <div className="text-2xl font-bold mt-1 flex flex-wrap gap-2">
                {album.artists.map((artist: any) => (
                  <Link
                      key={artist.id}
                      href={`/artists/${artist.id}`}
                      className="text-blue-500 hover:underline"
                  >
                  {artist.name}
                   </Link>
                ))}
            </div>

              <p className="text-sm text-gray-500 mt-1">{album.release_date}</p>
            </div>

            <AlbumPlayerClient albumId={album.id}/>
            <Albumdash
              albumId={album.id}
              albumName={album.name}
              artistName={album.artists.map((a: any) => a.name).join(', ')}
              releaseYear={album.release_date.slice(0, 4)}
              imageUrl={album.images?.[0]?.url ?? ''}
            />
          </div>
        </div>

        {/* Tracklist Section */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Tracklist</h2>
          <ol className="mt-8 space-y-4">
            {album.tracks.items.map((track: any, index: number) => (
              <li key={track.id} className="flex justify-between items-start">
                <div className="flex gap-4">
                  <span className="w-6 text-right text-sm text-gray-500">{index + 1}</span>
                  <div>
                    <p className="text-white text-base font-medium">{track.name}</p>
                    {track.artists.length > 1 && (
                      <p className="text-sm text-gray-400">
                        {track.artists.map((artist: any) => artist.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  {Math.floor(track.duration_ms / 60000)}:
                  {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Reviews</h2>
        <ReviewList albumId={album.id} />
      </div>
    </>
  );
}
