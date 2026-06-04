# Aura

Aura is a React + Vite streaming discovery app for finding movies and TV shows from online APIs and checking where titles are available to stream.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production build is generated in `dist`.

## Vercel Deployment

Use these settings when importing the GitHub repository into Vercel:

- Framework preset: `Vite`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

`vercel.json` includes a rewrite to `index.html` so browser refreshes on React Router routes work correctly.

## Environment Variables

Add these variables in Vercel Project Settings. `VITE_TMDB_API_KEY` is required for movie feeds, browse, and search:

```bash
VITE_OMDB_API_KEY=
VITE_STREAMING_API_KEY=
VITE_TMDB_API_KEY=
```

Home, browse, search, and carousel movie feeds use TMDb through `VITE_TMDB_API_KEY`. No local movie catalog is bundled.
