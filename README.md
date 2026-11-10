# DWMS — Rajasthan Ore Hub Dashboard

A Next.js implementation of the supplied DWMS dashboard screenshot.

## Requirements

- Node.js 20+ (Node 22 is recommended)
- npm 10+

## Run locally

```bash
npm install
npm run dev
```

Open:

http://localhost:3000

## Production build

```bash
npm run build
npm start
```

## Project structure

```text
dwms-nextjs/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Dashboard.tsx
├── next.config.ts
├── next-env.d.ts
├── package.json
├── tsconfig.json
└── README.md
```

The dashboard is intentionally self-contained. The chart visuals are SVG/CSS, so no chart service or CDN is required.
