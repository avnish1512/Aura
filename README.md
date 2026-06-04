# Aura

Aura is a React + Vite streaming discovery app for finding movies and TV shows, browsing a local catalog, and checking where titles are available to stream.

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

The app can run without API keys by using bundled fallback data. For live API calls, add these variables in Vercel Project Settings:

```bash
VITE_OMDB_API_KEY=
VITE_STREAMING_API_KEY=
VITE_TMDB_API_KEY=
```
