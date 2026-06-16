# BaladVerse 🌍

**BaladVerse** is an interactive storytelling map of Palestine. Explore cities, share memories, and discover stories tied to real geographic locations — a social, map-first storytelling platform (not a news site).

![Stack](https://img.shields.io/badge/Next.js-14-black) ![Stack](https://img.shields.io/badge/Express-5-green) ![Stack](https://img.shields.io/badge/SQLite-blue) ![Stack](https://img.shields.io/badge/100%25_Free-brightgreen)

## Features

- **Interactive Map** — Full-screen Leaflet + OpenStreetMap (no API key) with city pins and trending indicators
- **City Pages** — Overview, stories, image gallery, contribution rankings
- **Story System** — Create stories with images, categories, and geo-coordinates
- **Feed** — Global feed with city/category filters and infinite scroll
- **Explore** — Browse all cities, trending locations, most active areas
- **Trending** — Top stories, loved cities, activity heatmap overlay
- **Gamification** — Points per story, badges (Story Keeper, City Explorer, Memory Collector)
- **Auth** — JWT registration & login
- **Images** — Upload via Cloudinary if configured, or free placeholder images automatically

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 14, TypeScript, Tailwind, Leaflet + OpenStreetMap, Framer Motion |
| Backend  | Node.js, Express, TypeScript, REST API |
| Database | SQLite (local file) — no server, no cost |
| Auth     | JWT (self-hosted)                   |
| Storage  | Optional Cloudinary; free placeholders by default |

## Project Structure

```
├── frontend/          # Next.js App Router
│   ├── app/           # Pages (map, feed, explore, etc.)
│   ├── components/    # UI, map, stories
│   └── lib/           # API client, auth, types
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── middleware/
│   └── prisma/        # Schema & seed
└── README.md
```

## Prerequisites (all free)

- **Node.js** 18+ only — [nodejs.org](https://nodejs.org/)
- No Mapbox, PostgreSQL, or Cloudinary account required
- Data file: `backend/prisma/dev.db` (SQLite)
- Map tiles: free CARTO/OSM (no signup)
- Story images without Cloudinary: free placeholders from picsum.photos

## Setup

### 1. Backend

```bash
cd backend
```

**Windows (CMD or PowerShell):**
```bat
copy .env.example .env
```

**macOS / Linux:**
```bash
cp .env.example .env
```

```bash
# Optional: edit JWT_SECRET, Cloudinary keys
npm install
npm run db:setup
npm run dev
```

API runs at **http://localhost:4000**

### 2. Frontend

```bash
cd frontend
```

**Windows:** `copy .env.example .env.local`  
**macOS / Linux:** `cp .env.example .env.local`

```bash
npm install
npm run dev
```

App runs at **http://localhost:3000**

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite path (default `file:./dev.db`) |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (default `7d`) |
| `PORT` | API port (default `4000`) |
| `CLOUDINARY_*` | Cloudinary credentials |
| `FRONTEND_URL` | CORS origin (default `http://localhost:3000`) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base URL (default `http://localhost:4000/api`) |

## Demo Account

After seeding:

- **Email:** `demo@baladverse.com`
- **Password:** `demo1234`

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Stories
- `GET /api/stories` — List (pagination, filters)
- `GET /api/stories/:id`
- `GET /api/stories/city/:cityId`
- `POST /api/stories` — Create (multipart, auth required)
- `POST /api/stories/:id/like`

### Cities
- `GET /api/cities`
- `GET /api/cities/:id`

### Users
- `GET /api/profile` or `GET /api/users/profile`
- `POST /api/users/saved-places`
- `DELETE /api/users/saved-places/:cityId`

### Trending
- `GET /api/trending`

## Gamification

| Action | Reward |
|--------|--------|
| Post a story | +10 points |
| Story Keeper badge | 3+ stories |
| City Explorer badge | Stories in 5+ cities |
| Memory Collector badge | 5+ memory-category stories |

Cities with **5+ stories** show a 🔥 trending indicator on the map.

## License

MIT — Built with respect for Palestinian heritage and storytelling.
