import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const year = 2026;

// A stable launch set for the home-page carousel. These are full albums only
// (no singles, clean duplicates, or compilations), so the carousel is useful
// even when Spotify's API is rate-limited.
const albums = [
  ['6nrtxtgaD9zSYBl9APvOCH', 'Dandelion', 'Ella Langley', 'curated-ella-langley', 'https://i.scdn.co/image/ab67616d0000b2738606848da949bbaddf447d87', 18],
  ['0pFlE0rc68RS8f3UHzioQY', 'The Real Me', 'Future', '1RyvyyTE3xzB2ZywiAwp0i', 'https://i.scdn.co/image/ab67616d0000b2737be3f7b0e24b805916d65514', 22],
  ['3WZZF72ihlKPZBS4zSsNHl', 'you seem pretty sad for a girl so in love', 'Olivia Rodrigo', '1McMsnEElThX1knmY4oliG', 'https://i.scdn.co/image/ab67616d0000b2735cf234eeb7a2edf44bf64a46', 13],
  ['2fnkyn9EybagIoFJ7a13oz', 'The Great Divide', 'Noah Kahan', '2RQXRUsr4IW1f3mKyKsy4B', 'https://i.scdn.co/image/ab67616d0000b273d879855b819250d3d00a1a38', 17],
  ['0OAv7DCME2AV4q1KPO95HY', 'ICEMAN', 'Drake', '3TVXtAsR1Inumwj472S9r4', 'https://i.scdn.co/image/ab67616d0000b273fe9d3ab9adb1d3b59835b81c', 18],
  ['3ukkRHDHbN8tNRPKsGZR1h', 'ARIRANG', 'BTS', '3Nrfpe0tUJi4K4DXYWgMUX', 'https://i.scdn.co/image/ab67616d0000b273dfa17fad7f190c901603270e', 14],
  ['131x9G87mD0hP0hGZc9qYN', 'OCTANE', 'Don Toliver', '4Gso3d4CscCijv0lmajZWs', 'https://i.scdn.co/image/ab67616d0000b27325c28f3c9fbdbab1a88dd619', 18],
  ['4itKk52E9ZCdWUQcFAkud9', "Don't Be Dumb", 'A$AP Rocky', '13ubrt8QOOCPljQ2FL1Kca', 'https://i.scdn.co/image/ab67616d0000b273be35d523672e13da3debc413', 17],
  ['4iP0J5eIBe463ufR0C1lZI', 'The Fall-Off', 'J. Cole', '6l3HvQ5sa6mXTsMTB19rO5', 'https://i.scdn.co/image/ab67616d0000b273adf228039af060f4bd880536', 24],
  ['5KS0QmxwUmSPsolg9VaSAU', 'Kehlani', 'Kehlani', '0cGUm45nv7Z6M6qdXYQGTX', 'https://i.scdn.co/image/ab67616d0000b273d9233d03f5434d9dd46c9fd6', 17],
  ['5Asm8hPfn7pAlxpoir4ljs', 'Cry Baby', 'Vince Staples', '68kEuyFKyqrdQQLLsmiatm', 'https://i.scdn.co/image/ab67616d0000b273dd168c97fdd98891f1f5ca26', 10],
  ['289GZwycrFReuNB706obBx', 'Oh yeah?', 'Steve Lacy', '57vWImR43h4CaDao012Ofp', 'https://i.scdn.co/image/ab67616d0000b2734ea9ba86cd9506a004bab042', 10],
  ['57od8OD4RYQiCe9jKKiUCW', 'HABIBTI', 'Drake', '3TVXtAsR1Inumwj472S9r4', 'https://i.scdn.co/image/ab67616d0000b273bb0ef065b3eecc5f1c9ab26b', 11],
  ['6sKe2lWmQxRYhhUnN7dln3', 'ADL', 'Yeat', 'curated-yeat', 'https://i.scdn.co/image/ab67616d0000b27388fc1b9c89137e73c62d216f', 21],
  ['38KDcpMrViyGMwOuyXT3VS', 'BULLY', 'Ye', '5K4W6rqBFWDnAN6FQUkS6x', 'https://i.scdn.co/image/ab67616d0000b273a5b60fa49a6896ec89539c6e', 13],
];

function normalize(value) {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

async function main() {
  for (const [id, name, artistName, artistId, imageUrl, totalTracks] of albums) {
    await prisma.artist.upsert({
      where: { id: artistId },
      create: { id: artistId, name: artistName, normalizedName: normalize(artistName) },
      update: { name: artistName, normalizedName: normalize(artistName) },
    });

    await prisma.album.upsert({
      where: { id },
      create: {
        id,
        name,
        normalizedName: normalize(name),
        artistId,
        artistName,
        imageUrl,
        releaseDate: `${year}-01-01`,
        albumType: 'album',
        totalTracks,
      },
      update: {
        name,
        normalizedName: normalize(name),
        artistId,
        artistName,
        imageUrl,
        releaseDate: `${year}-01-01`,
        albumType: 'album',
        totalTracks,
      },
    });
  }

  await prisma.$transaction([
    prisma.popularAlbum.deleteMany({ where: { year } }),
    prisma.popularAlbum.createMany({
      data: albums.map(([albumId], index) => ({ year, albumId, position: index + 1 })),
    }),
  ]);

  console.log(`Seeded ${albums.length} curated popular albums for ${year}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
