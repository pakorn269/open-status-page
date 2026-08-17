# Open Status Page

An open-source, community-run status monitor for **[gateway.9arm.co](https://gateway.9arm.co)** — an Anthropic-compatible API gateway. Built with React 19, TypeScript, Vite, and Supabase.

> **Disclaimer:** This project is not affiliated with or endorsed by the operators of `gateway.9arm.co`. It is an independent community tool for checking whether the gateway is publicly reachable.

🟢 **Live:** [open-status-page.sinon-7cf.workers.dev](https://open-status-page.sinon-7cf.workers.dev)

![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Built with React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat-square&logo=cloudflare)

---

## ✨ Features

- **Animated status banner** — Operational / Degraded / Major Outage with pulsing dot + response time badge
- **90-day uptime grid** — color-coded calendar blocks with hover tooltips
- **Incident history** — grouped by month, with impact badges (none / minor / major / critical)
- **Component status list** — per-service uptime percentage + last response time
- **Skeleton loader** — shimmer animation while data is fetching
- **Dark mode** — persisted via `localStorage`, respects OS preference
- **URL-synced tabs** — `/`, `/incidents`, `/uptime` with browser back/forward support
- **Auto-refresh** — polls for new data silently every 60 seconds
- **Automated health checks** — Supabase Edge Function pings the gateway every 5 minutes via `pg_cron + pg_net`
- **End-to-end health verification** — authenticates and invokes a real model call (`max_tokens: 1`) to confirm the full pipeline is working

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Typography | Inter (Google Fonts) |
| Icons | Lucide React |
| Backend / DB | Supabase (PostgreSQL + Edge Functions) |
| Hosting | Cloudflare Workers (static assets) |
| Date handling | Day.js |

---

## 🚀 Self-Hosting Guide

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Supabase account](https://supabase.com) (free tier is sufficient)
- [Cloudflare account](https://cloudflare.com) (for deployment)

### 1. Clone the repository

```bash
git clone https://github.com/pakorn269/open-status-page.git
cd open-status-page
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` key |
| `SUPABASE_URL` | Your project reference ID (e.g. `abcdefghijklmnop`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key (**keep secret**) |
| `ANTHROPIC_AUTH_TOKEN` | The API key used to authenticate health-check pings |

> `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are **public-safe** — they're the anon key protected by Row Level Security and are intentionally hardcoded as fallbacks in `src/lib/supabase.ts` for static asset deployments.
> Never commit your `service_role` key or `ANTHROPIC_AUTH_TOKEN`.

### 4. Set up the Supabase database

Run these SQL files **in order** in the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql):

```
1. supabase/setup_api_logs.sql   — Creates api_status_logs table + get_uptime_90_days() RPC
2. supabase/setup.sql            — Creates incidents table + seeds sample data + schedules cron job
```

> **Before running `setup.sql`:** Replace `YOUR_PROJECT_REF` on the last line with your actual Supabase project reference ID.

### 5. Deploy the Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Authenticate and link to your project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets (these are injected into the Edge Function at runtime)
supabase secrets set ANTHROPIC_AUTH_TOKEN=your_api_key_here
supabase secrets set SERVICE_ROLE_KEY=your_service_role_key_here

# Deploy
supabase functions deploy health-check
```

The Edge Function is scheduled automatically by `pg_cron` to run every 5 minutes. It makes an authenticated POST to `/v1/messages` using your `ANTHROPIC_AUTH_TOKEN` with `max_tokens: 1` to verify the full pipeline end-to-end at near-zero cost.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## ☁️ Deploy to Cloudflare Pages

1. Push to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/) → **Create a project** → connect your repo
3. Set the build configuration:

| Setting | Value |
|---|---|
| Framework preset | **Vite** |
| Build command | `npm run build` |
| Output directory | `dist` |

4. Add environment variables under **Settings → Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. Deploy. SPA routing (`/incidents`, `/uptime`) is handled by [`public/_redirects`](public/_redirects) (Cloudflare Workers static assets handle it natively).

---

## ⚙️ Customizing for your endpoint

### Change the monitored URL

Edit [`supabase/functions/health-check/index.ts`](supabase/functions/health-check/index.ts):

```ts
// Change this to your own endpoint
const response = await fetch("https://your-api-endpoint.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": apiKey,
    // adjust headers to match your API
  },
  body: JSON.stringify({ ... }),
});
```

### Change the displayed service name

Edit [`src/App.tsx`](src/App.tsx) — look for `componentsData`:

```ts
const componentsData: ServiceComponent[] = [
  {
    id: 'comp1',
    name: 'your-service.com',   // ← displayed name
    ...
  }
];
```

### Add more monitored services

1. Create additional Edge Functions (one per endpoint)
2. Add a new `cron.schedule` entry in `setup.sql` for each
3. Extend `componentsData` in `App.tsx` with separate uptime tracking per service

---

## 📁 Project Structure

```
open-status-page/
├── .vscode/
│   └── settings.json                # Scopes Deno language server to supabase/functions/
├── public/
│   └── _redirects                   # SPA routing fallback
├── src/
│   ├── components/
│   │   ├── Header.tsx               # Logo + GitHub link + dark mode toggle
│   │   ├── StatusBanner.tsx         # Animated status indicator with response time badge
│   │   ├── ComponentList.tsx        # Per-service status list + response time
│   │   ├── UptimeGrid.tsx           # 90-day calendar uptime grid
│   │   ├── IncidentHistory.tsx      # Full incident log grouped by month
│   │   └── PastIncidents.tsx        # 14-day incident summary (proper date matching)
│   ├── lib/
│   │   └── supabase.ts              # Supabase client (public keys hardcoded as fallback)
│   ├── App.tsx                      # Main app — data fetching, routing, skeleton loader
│   ├── index.css                    # Tailwind + Inter font + shimmer/pulse animations
│   └── main.tsx
├── supabase/
│   ├── functions/
│   │   └── health-check/
│   │       ├── index.ts             # Edge Function — authenticated end-to-end ping
│   │       └── deno.json            # Deno compiler config for IDE support
│   ├── setup.sql                    # incidents table + cron schedule
│   └── setup_api_logs.sql           # api_status_logs table + 90-day uptime RPC
├── .env.example                     # Environment variable template
└── DESIGN.md                        # Design system reference
```

---

## 📄 License

MIT
