# WindMar Content Hub — Transfer Package

This zip is a complete, portable copy of the **`studio`** project (the WindMar Home
Content Hub). It contains everything needed to run and deploy the app on another
platform. Heavy or machine‑specific folders (`node_modules`, `.next`, `.git`,
`.vercel`) and the secret file (`.env.local`) are **not** included — you rebuild
those on the new machine.

---

## 1. What's inside

```
studio/
├── src/                 Next.js app (App Router): pages + /api routes + components
│   └── app/api/         chat, assistant, assets, asana  (server routes)
├── public/              ALL the content — 54 HTML pieces + images/video/PDF
│                        (flyers, stories, carousels, calendars, guiones, etc.)
├── package.json         dependencies + scripts
├── package-lock.json    exact versions (use `npm ci` to reproduce)
├── next.config.ts       Next.js config
├── tsconfig.json        TypeScript config
├── postcss.config.mjs   Tailwind/PostCSS
├── eslint.config.mjs
├── .env.local.example   template for the environment variables (NO secrets)
├── README.md
└── TRANSFER_INSTRUCTIONS.md   ← this file
```

> The static marketing pieces live in `public/` and are served at the site root.
> Example: `public/windmar-pr-stories.html` → `https://your-site/windmar-pr-stories.html`

---

## 2. Environment variables (set these on the new platform)

Copy `.env.local.example` to `.env.local` and fill in the values. On a hosting
platform, add them in the project's **Environment Variables** settings instead.

| Variable            | Needed for                                   | Where to get it |
|---------------------|----------------------------------------------|-----------------|
| `ANTHROPIC_API_KEY` | AI assistant in the Lienzo/Canvas            | console.anthropic.com |
| `ASANA_TOKEN`       | Asana integration (`/api/asana`)             | Asana → Settings → Apps → Developer apps → Personal access token |
| `ASANA_PROJECT_ID`  | Which Asana project to read (has a default)  | Asana project URL |

If you only need the **static content** (the HTML flyers/stories/etc.) you do
**not** need any of these — see Option B below.

---

## 3. Option A — Run / deploy the full Next.js app

This is a Next.js app. It runs on any host that supports Node.js 20+ (Vercel,
Netlify, Render, Railway, Cloudflare, a VPS, etc.).

### Local run
```bash
cd studio
npm ci            # installs exact versions from package-lock.json (or: npm install)
cp .env.local.example .env.local   # then fill in your keys
npm run dev       # http://localhost:3000
```

### Production build
```bash
npm run build
npm start         # serves the production build
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel            # first time: link/create the project
vercel --prod     # production deploy
```
Add the env vars in the Vercel dashboard (Project → Settings → Environment Variables).

### ⚠️ Known limit: the `/api/assets` function size
On Vercel, serverless functions have a **250 MB uncompressed** cap. Because the
app bundles the large media in `public/`, the `api/assets` function can exceed
this and fail the deploy with:
`The Vercel Function "api/assets" is …mb which exceeds the maximum … 250mb`.

Fixes (any one):
- Keep large images/videos compressed (photos as JPG ~80% quality, not multi‑MB PNG).
- Remove unused media from `public/`.
- On Vercel, set `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` (large‑functions beta) to raise the cap.
- Or host the big media on external storage/CDN and reference by URL.

---

## 4. Option B — Use ONLY the static content (simplest)

Every marketing piece is a **self‑contained HTML file** in `public/`. If you just
want to move the content (not the app), you can host `public/` on ANY static host
with zero build step:

- **Netlify / Cloudflare Pages / GitHub Pages / Amazon S3 / any web server:**
  upload the contents of `public/` and open the `.html` files directly.
- Fonts load from Google Fonts and each piece has its own **"⬇︎ PNG"** export button
  (uses `html-to-image`, no server needed).

Example after upload: `https://your-static-site/windmar-pr-stories.html`

---

## 5. Notes / gotchas

- **Node version:** use Node.js 20 LTS or newer.
- **This Next.js is pinned** to the exact version in `package-lock.json`. Use
  `npm ci` (not a fresh `npm install` with different versions) to reproduce the
  environment reliably. `AGENTS.md` notes this is a customized build.
- **Secrets were NOT included.** `.env.local` (with the real Asana token and
  Anthropic key) was intentionally left out. Recreate it from the `.example`.
- **Some HTML pieces read from Supabase** (e.g. the VIRA'O calendar / comments).
  Those talk to their own hosted Supabase projects over the network; nothing to
  install, but the Supabase URL/anon key are embedded in those HTML files.
- **`.DS_Store` and build caches** were excluded; they regenerate automatically.

---

## 6. Quick checklist for the new platform

- [ ] Unzip the package
- [ ] `npm ci`
- [ ] Create `.env.local` from `.env.local.example` and fill in keys (Option A only)
- [ ] `npm run dev` to verify locally
- [ ] `npm run build` succeeds
- [ ] Deploy; add env vars in the host's dashboard
- [ ] If deploy fails on function size, apply a fix from section 3
