'use client';

import dynamic from 'next/dynamic';

// Dynamically import with SSR disabled
const ArtistFollowButton = dynamic(() => import('./ArtistFollowButton'), {
  ssr: false,
});

export default function ArtistFollowClientWrapper({ artistId }: { artistId: string }) {
  return <ArtistFollowButton artistId={artistId} />;
}
