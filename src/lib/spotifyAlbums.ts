async function getSpotifyAccessToken() {
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

  return tokenData.access_token as string;
}

async function searchSpotifyAlbums(accessToken: string, query: string, limit = 10, offset = 0) {
  const albumsRes = await fetch(
    `https://api.spotify.com/v1/search?${new URLSearchParams({
      q: query,
      type: 'album',
      // Spotify Search allows no more than 10 results per request.
      limit: String(Math.min(limit, 10)),
      offset: String(offset),
    })}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const albumsData = await albumsRes.json();

  if (!albumsRes.ok || !Array.isArray(albumsData.albums?.items)) {
    throw new Error(`Spotify album search failed (${albumsRes.status})`);
  }

  return albumsData.albums.items as Array<{
    id: string;
    name: string;
    album_type?: string;
    release_date?: string;
    artists?: Array<{ id?: string; name?: string }>;
  }>;
}

export async function getSpotifyFallbackAlbums() {
  const accessToken = await getSpotifyAccessToken();
  return searchSpotifyAlbums(accessToken, `year:${new Date().getFullYear()}`);
}

export async function getPopularAlbumsThisYear() {
  const accessToken = await getSpotifyAccessToken();
  const year = String(new Date().getFullYear());
  const seen = new Set<string>();
  const uniqueAlbums: Array<{
    id: string;
    name: string;
    album_type?: string;
    release_date?: string;
    artists?: Array<{ id?: string; name?: string }>;
  }> = [];
  const addUniqueAlbum = (album: (typeof uniqueAlbums)[number]) => {
    const primaryArtist = album.artists?.[0]?.id ?? album.artists?.[0]?.name ?? '';
    const identity = `${album.name.toLowerCase()}::${primaryArtist.toLowerCase()}`;

    if (seen.has(identity)) return false;
    seen.add(identity);
    uniqueAlbums.push(album);
    return true;
  };

  // Keep the first cache fill gentle on Spotify: Search permits only ten
  // results per page, so fetch only the pages required to find fifteen albums.
  // The previous featured-query fan-out made 7+ simultaneous Spotify requests.
  for (let offset = 0; offset < 50 && uniqueAlbums.length < 15; offset += 10) {
    const generalReleases = await searchSpotifyAlbums(accessToken, `year:${year}`, 10, offset);

    for (const album of generalReleases) {
      if (album.album_type !== 'album' || !album.release_date?.startsWith(year)) continue;
      addUniqueAlbum(album);
      if (uniqueAlbums.length === 15) break;
    }
  }

  return uniqueAlbums;
}
