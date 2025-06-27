/*Callback page that we use as middleware for Spotify login

This helps myself and the user to detect errors that occur when attempting to log in to Spotify through the app
*/
import { Suspense } from 'react';
import SpotifyCallbackHandler from '@/components/SpotifyCallbackHandler';

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="text-white p-8">Processing login...</div>}>
      <SpotifyCallbackHandler />
    </Suspense>
  );
}

