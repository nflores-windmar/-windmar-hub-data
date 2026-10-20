# WindMar Content Hub — Static Documents

This package contains ONLY the static content of the Content Hub: every marketing
piece as a self‑contained HTML file, plus its images, video, fonts and PDFs.
**No build step, no server, no environment variables needed.**

## How to use

Host these files on ANY static host or open them directly:

- **Any static host** (Netlify, Cloudflare Pages, GitHub Pages, Amazon S3, or any
  web server): upload the entire contents of this folder, keeping the folder
  structure intact (the HTML references `img/…`, `video/…`, `wme/…`, etc. by
  relative path).
- **Open locally:** double‑click any `.html` file to view it in a browser.

Example after upload: `https://your-site/windmar-pr-stories.html`

## Good to know

- Each piece loads fonts from Google Fonts and has its own **"⬇︎ PNG"** export
  button (uses the `html-to-image` library from a CDN — needs internet the first
  time).
- Keep the relative folders together (`img/`, `video/`, `agua/`, `rwb/`, `wme/`,
  `whome/`, `assets/`) so images and logos resolve correctly.
- A few pieces (e.g. the VIRA'O calendar / comments) talk to a hosted Supabase
  backend over the network — that keeps working as long as there's internet; the
  connection details are embedded in those HTML files.
- To keep things light, prefer compressed images (JPG ~80%) over multi‑MB PNGs.
