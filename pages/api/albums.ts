/* This is used for the landing page to retrieve information about 
the most recently released albums on Spotify for our albumsCarousel to use. 

To do this, we make 2 fetches to the Spotify API:
1) Fetch a brand new token
2) Fetch 10 most recent new releases

NOTE: Only for landing albums carousel, but this logic could be vaired 
to retrieve different albums based on whatever the user wants. 

Could be altered so that it's design is more modular and reusable
*/

import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const client_id = process.env.SPOTIFY_CLIENT_ID!;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    const token = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

    try {
        // Here, we want to grab a fresh token before tryna do anything else
        const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                Authorization: `Basic ${token}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        // Now that we got the token, we can use it to grab albums
        //in this case, the most recent releases on spotify!
        const albumsRes = await fetch("https://api.spotify.com/v1/browse/new-releases?limit=10", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const albumsData = await albumsRes.json();

        // Finally, we want to return these albums to the frontend
        res.status(200).json(albumsData.albums.items);

    } catch (error) {
        console.error("Server error fetching albums: ", error);
        res.status(500).json({ error: "Failed to get albums from Spotify for Landing Carousel (most recent)" });
    }
}