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

const FEATURED_ALBUM_QUERIES = [
  'album:"Don\'t Be Dumb" artist:"A$AP Rocky"',
  'album:"OCTANE" artist:"Don Toliver"',
  'album:"Cry Baby" artist:"Vince Staples"',
  'artist:"Steve Lacy" year:2026',
  'album:"ICEMAN" artist:"Drake"',
  'album:"The Fall-Off" artist:"J. Cole"',
  'artist:"Kehlani" year:2026',
];

export async function getPopularAlbumsThisYear() {
  const accessToken = await getSpotifyAccessToken();
  const year = String(new Date().getFullYear());
  const results = await Promise.allSettled(
    FEATURED_ALBUM_QUERIES.map((query) => searchSpotifyAlbums(accessToken, query, 5))
  );

  const albums = results.flatMap((result) =>
    result.status === 'fulfilled'
      ? result.value.filter(
          (album) => album.release_date?.startsWith(year) && album.album_type === 'album'
        )
      : []
  );
  const seen = new Set<string>();
  const addUniqueAlbum = (album: (typeof albums)[number], collection: typeof albums) => {
    const primaryArtist = album.artists?.[0]?.id ?? album.artists?.[0]?.name ?? '';
    const identity = `${album.name.toLowerCase()}::${primaryArtist.toLowerCase()}`;

    if (seen.has(identity)) return false;
    seen.add(identity);
    collection.push(album);
    return true;
  };
  const uniqueAlbums: typeof albums = [];
  for (const album of albums) addUniqueAlbum(album, uniqueAlbums);

  if (uniqueAlbums.length >= 15) return uniqueAlbums.slice(0, 15);

  for (let offset = 0; offset < 50 && uniqueAlbums.length < 15; offset += 10) {
    const generalReleases = await searchSpotifyAlbums(accessToken, `year:${year}`, 10, offset);

    for (const album of generalReleases) {
      if (album.album_type !== 'album') continue;
      addUniqueAlbum(album, uniqueAlbums);
      if (uniqueAlbums.length === 15) break;
    }
  }

  return uniqueAlbums;
}
