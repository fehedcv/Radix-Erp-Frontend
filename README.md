# Radix ERP Frontend

A modern ERP web application built with **React + Vite + Tailwind CSS**, powered by **Supabase** for backend services.

## Project Overview

Radix ERP Frontend is designed to provide a fast, responsive, and scalable interface for ERP workflows. The project combines:

- **Frontend:** React + Vite + Tailwind CSS
- **Backend services:** Supabase (database, auth, and related backend functionality)

## Contributors

- **fehedcv** ([@fehedcv](https://github.com/fehedcv)) — Supabase/backend development
- **Shahad** ([@ShahadThayyil](https://github.com/ShahadThayyil)) — Frontend development with React, Vite, and Tailwind CSS

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS 4
- Supabase JavaScript Client
- Capacitor (mobile platform support)
- ApexCharts / Recharts

## Getting Started

### Prerequisites

- Node.js 18+ (recommended latest LTS)
- npm (or another package manager)

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will usually run at `http://localhost:5173`.

## Available Scripts

- `npm run dev` — Start the Vite development server
- `npm run build` — Build for production
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run ESLint checks

## Environment Configuration

Create a `.env` file in the project root and add your Supabase credentials (example):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Do not commit real secrets or private keys.

## Project Structure

```text
.
├── public/               # Static assets
├── src/                  # Application source code
├── index.html            # Vite entry HTML
├── package.json          # Scripts and dependencies
└── README.md             # Project documentation
```

## Build & Deployment

To generate an optimized production build:

```bash
npm run build
```

You can deploy the generated `dist/` folder to any static hosting provider.

## License

This project is currently unlicensed. Add a `LICENSE` file if you want to define usage terms.
