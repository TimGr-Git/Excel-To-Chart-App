# Chart App (Next.js)

This repository contains a Next.js + TypeScript application for building and saving simple charts.

## Intended audience

- Developers who clone or download this repository and want to run the app locally (development or production).

## Prerequisites

- Node.js 18.x or newer (LTS recommended)
- npm (installed with Node) or an alternative package manager (yarn, pnpm)
- Optional: Git and a Git client (GitHub Desktop, command line git)

## Install dependencies

From the project root (the folder containing `package.json`) run:

```bash
npm install
```

## Run locally (development)

Start the dev server (fast refresh enabled):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build and run (production)

Build the app and start a production server:

```bash
npm run build
npm run start
```

## Notes about build artifacts

- The `.next/` folder is a local build artifact and is ignored by git (see `.gitignore`). Do not commit `.next/`.

## Environment files

- Use `.env.local` for any local environment variables. This file is ignored by git by default.

## Key libraries used

- Next.js (App Router) — framework and server-side rendering
- React + TypeScript — UI and static typing
- Tailwind CSS — utility-first styling
- D3 (used in chart components) — drawing charts
- react-icons — common UI icons

## Application notes

- Chart images saved by the app are stored in localStorage under the key `dashboardLibraryImages`.
  - Saved images may be data: URLs or blob URLs depending on how the image was captured. Blob URLs are not stable across browser sessions unless converted to data URLs before saving.
- Cross-component communication uses browser CustomEvents (examples: `dashboardLibraryAddImage`, `excelUploaded`, `navigateToDataTable`).
- Static assets (example icons) should be placed in the `public/` folder (e.g. `public/SideBarIcons/`) so Next.js serves them.

## Troubleshooting

- If a component or image does not render, check the browser console for errors and ensure `npm install` completed without missing packages.
- ESLint warnings about `<img>` may appear; the project mixes `next/image` and plain `<img>` depending on the use case (data/blob URLs vs static assets).

## Contributing / development tips

- Edit UI in `app/` (App Router). Run `npm run dev` while developing.
- Keep large binary assets out of git; add them to `public/` if needed for demos.

## .gitignore

- The repository already contains a `.gitignore` that excludes `node_modules`, `.next`, and environment files.

## Questions or next steps

- I can add a short example `.env.local.example` file, or tighten the README with contributor guidelines. Tell me which you prefer.
