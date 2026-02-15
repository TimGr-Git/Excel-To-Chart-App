# Chart App (Next.js)

A Next.js + TypeScript application for uploading Excel files, visualizing the data as tables and charts, and saving exported visuals locally.

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

Start the development server (fast refresh enabled):

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Note about building: you can create a production build with `npm run build`, which generates the `.next/` build artifacts that are not committed to the repository. For most development or evaluation purposes `npm run dev` is sufficient. If you plan to run the production build, run `npm run build` and then `npm run start`.

## Key libraries used

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- D3 (used in chart components)
- react-icons
- exceljs (for parsing Excel files)

## Application notes

- Upload Excel files: users can upload .xlsx/.xls files via the Upload box; the server endpoint parses and returns labeled data used throughout the app.
- Visualize Excel data in a table: uploaded Excel content is shown in the Data Table view for searching, sorting and inspection.
- Create and customize plots based on Excel data: Analytics provides configurable chart types (line, bar) and design controls (colors, axis, title) to personalize visuals.
- Saving uploads and plots locally: uploaded data history and saved chart images are persisted in the browser (localStorage) so they remain available between sessions on the same device.

## To Do

- Add a Project-level view linking uploaded datasets and saved library images (project metadata + grouping)
- Optimize the plot rendering and add richer customization options (layout, annotations, export quality)
- Improve data validation and normalization per graph type so uploaded sheets display meaningfully
- Enhance the Data Table page to allow light data manipulation and preparation (filtering, type coercion, preview transformations)
- Add more chart types (scatter, area, histograms, stacked/ grouped variants)
