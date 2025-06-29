https://soundbase.vercel.app

---

# 🎧 Soundbase

Soundbase is a full-stack social music platform where users can discover, review, and interact around albums and artists. It integrates music streaming, user-generated content, and real-time features to create an interactive music discovery experience. I developed this app because of a problem I experience daily - there is no dedicated platform for music discourse! Sure, apps like Twitter/X and Instagram exist where users can discuss music, but these applications don't prioritize the experience from a music lover's perspective. 

---

> I truly hope your experience using Soundbase is enjoyable and seamless! If you are passionate about music like I am, I'm confident that this is the app you've been waiting for.

## 🔧 Tech Stack

- **Frontend**: Next.js 14 / React / TypeScript / Tailwind CSS  
- **Backend**: Next.js App Router API routes  
- **Database**: PostgreSQL (via Prisma ORM)  
- **Authentication**: Google OAuth (via NextAuth.js) + JWT  
- **Streaming**: Spotify Web Playback SDK  
- **Hosting**: Vercel (frontend & serverless functions) + Supabase (PostgreSQL DB)

---

## ✨ Key Features

- 🔐 **Secure Auth**: Sign in via Google OAuth with JWT-based session handling  
- 📀 **Dynamic Album Pages**: Pull album metadata via Spotify API and render song lists, cover art, and more  
- ⭐ **Album Reviews**: Leave detailed reviews with a scroll-based rating pill component and optionally rank tracks
- 💬 **Comments & Threads**: Interact with reviews via threaded comments, replies, and discussion posts  
- ❤️ **Engagement Tools**: Like, repost, comment, and track view counts on posts
- 📷 **Listening Sessions**: Listen to music in real time with friends
- 📈 **Review Scores**: Average scores calculated and displayed per album in real time  
- 🎵 **Streaming**: Logged-in Spotify Premium users can stream albums directly  
- 🧑‍🤝‍🧑 **Follow System**: Follow users and artists to see their activity and reviews  
- 📱 **Responsive Design**: Clean, mobile-friendly UI mimicking Apple Music and Twitter  

---

## 🧰 Key Tools & Integrations

- **Spotify Web API** – For fetching album/track metadata and enabling streaming  
- **Spotify Web Playback SDK** – For full in-browser audio playback (Premium only)  
- **Google OAuth (NextAuth)** – Seamless login/signup flow
- **WebRTC and Socket.IO** - Real-time video/audio calls with in-sync music streaming between parties
- **Prisma** – Schema-based ORM for type-safe DB queries  
- **Supabase** – Hosted PostgreSQL with serverless database access  
- **Tailwind CSS** – Utility-first CSS framework for rapid UI development  
- **Vercel** – Deploys frontend and backend serverless functions in one place  

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/soundbase.git
cd soundbase
npm install
```

### 2. Setup Environment Variables

Create a `.env` file based on `.env.example` and add:

```env
# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URL=http://localhost:3000/callback

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_jwt_secret

# Database
DATABASE_URL=postgresql://your_supabase_url

# NextAuth
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run Locally

Start the development server:

```bash
npm run dev
```
---

## 🗺️ App Navigation

- `/albums/[id]` – View a specific album page with stream button, score, reviews, and discussion  
- `/profile/[id]` – View user profiles with Posts, Likes, and Followers tabs  
- `/callback` – Spotify OAuth redirect handler  
- `/api/*` – REST-style endpoints for posts, comments, likes, follow checks, and streaming  
- **MusicPlayerBar** – Persistent player bar at the bottom of every page when streaming is active

---

## 📌 Contributing

This project is open to collaboration! If you have suggestions or feature ideas:

1. Open an issue  
2. Submit a pull request  
3. Join the discussion ✨

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Acknowledgements

- [Spotify Developer Portal](https://developer.spotify.com/)  
- [NextAuth.js](https://next-auth.js.org/)  
- [Supabase](https://supabase.io/)  
- [Vercel](https://vercel.com/)

---

