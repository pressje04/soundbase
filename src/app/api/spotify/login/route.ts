/* Login API for SPOTIFY, not login for the platform itself.
This is handled in /app/api/login
*/
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateRandomStr(length: number) {
  return crypto.randomBytes(length).toString('hex');
}

function base64URLEncode(buffer: Buffer) {
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function sha256(buffer: string) {
  return crypto.createHash('sha256').update(buffer).digest();
}

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;
  const state = generateRandomStr(16);
  const codeVerifier = generateRandomStr(64);
  const codeChallenge = base64URLEncode(sha256(codeVerifier));

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'streaming user-read-email user-read-private user-modify-playback-state',
    redirect_uri: redirectUri,
    state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  const response = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
  response.cookies.set('spotify_code_verifier', codeVerifier, { path: '/' });
  return response;
}
