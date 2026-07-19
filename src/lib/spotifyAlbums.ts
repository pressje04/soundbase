export async function getSpotifyFallbackAlbums() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials are not configured');
  }

  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(`Spotify token request failed (${tokenRes.status})`);
  }

  const year = new Date().getFullYear();
  const albumsRes = await fetch(
    `https://api.spotify.com/v1/search?q=year%3A${year}&type=album&limit=10`,
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  );
  const albumsData = await albumsRes.json();

  if (!albumsRes.ok || !Array.isArray(albumsData.albums?.items)) {
    throw new Error(`Spotify album search failed (${albumsRes.status})`);
  }

  return albumsData.albums.items;
}
