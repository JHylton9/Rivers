# OpenFreeMap + @vis.gl/react-maplibre Example

Built with [@vis.gl/react-maplibre](https://visgl.github.io/react-maplibre/)

```sh
pnpm install
pnpm data
pnpm dev
```

The app converts the root-level `rivers.*` shapefile set into browser-ready
GeoJSON at `public/data/` before production builds.

## Vercel

This repository is configured for Vercel from the repo root with
[vercel.json](/C:/Users/JaydonPC/Documents/GitHub/Rivers/vercel.json:1).
Vercel will:

- install dependencies in `react-example`
- run the app build from `react-example`
- publish `react-example/dist`
- rewrite all routes to `index.html` for SPA deep links
