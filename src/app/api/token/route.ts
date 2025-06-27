// This is used when we want to grab a token from the Spotify API.

import { NextResponse } from "next/server";

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function GET() {
  const client_id = process.env.SPOTIFY_CLIENT_ID!;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;

  if (!client_id || !client_secret) {
    return NextResponse.json({ error: 'Missing Spotify credentials' }, { status: 500 });
  }

  const now = Date.now();
  if (cachedToken && now < cachedToken.expiresAt) {
    return NextResponse.json({ access_token: cachedToken.value });
  }

  const token = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await tokenRes.json();

    if (!data.access_token) {
      return NextResponse.json({ error: 'Spotify token error', data }, { status: 500 });
    }

    cachedToken = {
      value: data.access_token,
      expiresAt: now + data.expires_in * 1000 - 60_000, // expires in ~59 mins
    };

    return NextResponse.json({ access_token: data.access_token });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch token" },
      { status: 500 }
    );
  }
}
