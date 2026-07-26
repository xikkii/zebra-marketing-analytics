# zebra — Marketing Analytics & Predictive Insights

> Know if your campaign wins **before** it runs.

zebra is a full-stack marketing analytics platform that uses a pre-trained regression model to predict campaign CAC, conversion rate, and ROI — before you spend a single dollar. It also provides a live dashboard aggregating performance across historical campaigns by channel.

![zebra landing page](https://img.shields.io/badge/stack-React%20%2B%20Express%20%2B%20Supabase-0B1220?style=flat-square&labelColor=131B2E&color=E8A33D)

---

## Features

- **Predictive Engine** — Input campaign parameters and instantly get predicted CAC (R² 0.81), conversion rate (R² 0.91), and ROI (R² 0.84), with a success probability classifier at 92.6% accuracy
- **Campaign Dashboard** — Live aggregated metrics and per-channel bar charts powered by Supabase views over 4,000 historical campaigns
- **Model Insights** — Transparent model card showing coefficients, training methodology, and metric breakdowns
- **Authentication** — Full sign-up / sign-in with Clerk (email + Google OAuth), protected routes, and user profile in the sidebar
- **Prediction History** — Every prediction is saved to Supabase and surfaced on the dashboard

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Recharts, Wouter |
| Backend | Express 5, Node.js 24, TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Clerk (Replit-managed) |
| API contract | OpenAPI 3.1 → Orval codegen (React Query hooks + Zod schemas) |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
/
├── artifacts/
│   ├── zebra/              # React + Vite frontend
│   │   ├── src/
│   │   │   ├── pages/      # Dashboard, Predictor, Insights, LandingPage
│   │   │   ├── components/ # Shell layout, UI primitives (shadcn)
│   │   │   └── lib/
│   │   │       └── model.ts  # Client-side prediction model (baked coefficients)
│   │   └── public/
│   │       └── logo.svg
│   └── api-server/         # Express API
│       └── src/
│           ├── routes/     # /api/dashboard, /api/predictions
│           ├── lib/        # Supabase client, logger
│           └── middlewares/# Clerk proxy middleware
├── lib/
│   ├── api-spec/           # OpenAPI spec (source of truth)
│   ├── api-client-react/   # Orval-generated React Query hooks
│   └── api-zod/            # Orval-generated Zod validators
└── pnpm-workspace.yaml
```

---

## Prediction Model

The model is a pre-trained linear/logistic regression with baked-in coefficients, trained on 4,000 real marketing campaigns. It runs entirely client-side in `lib/model.ts` with no external API calls.

**Inputs:** channel, industry, target audience, campaign objective, budget, duration, audience size, creative quality score, past engagement score, seasonality index

**Outputs:**
| Metric | Model type | R² / Accuracy |
|---|---|---|
| Customer Acquisition Cost | Linear regression | R² = 0.81 |
| Conversion Rate | Linear regression | R² = 0.91 |
| ROI | Linear regression | R² = 0.84 |
| Will Succeed | Logistic classifier | 92.6% accuracy |

---

## Database Schema

Run this once in your **Supabase SQL Editor**:

```sql
-- campaigns table (import campaign_data.csv here)
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  channel text not null, industry text not null,
  target_audience text not null, objective text not null,
  budget numeric(14,2), duration_days integer,
  target_audience_size integer,
  creative_quality_score numeric(5,2),
  past_engagement_score numeric(5,2),
  seasonality_index numeric(5,2),
  roi numeric(10,4), cac numeric(14,2),
  conversion_rate numeric(8,6),
  revenue numeric(16,2), spend numeric(14,2),
  is_successful boolean default false,
  created_at timestamptz default now()
);

-- predictions table (auto-populated by the app)
create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  campaign_name text,
  channel text not null, industry text not null,
  target_audience text not null, objective text not null,
  budget numeric(14,2), duration_days integer,
  target_audience_size integer,
  creative_quality_score numeric(5,2),
  past_engagement_score numeric(5,2),
  seasonality_index numeric(5,2),
  predicted_cac numeric(14,2),
  predicted_conversion_rate numeric(8,6),
  predicted_roi numeric(10,4),
  success_probability numeric(6,4),
  will_succeed boolean,
  estimated_conversions numeric(14,2),
  estimated_revenue numeric(16,2),
  created_at timestamptz default now()
);

-- Views
create view public.dashboard_summary as
  select count(*) as total_campaigns,
    avg(roi) as avg_roi, avg(cac) as avg_cac,
    avg(conversion_rate) as avg_conversion_rate,
    100.0 * sum(case when is_successful then 1 else 0 end)::numeric / nullif(count(*),0) as overall_success_rate_pct,
    sum(revenue) as total_revenue, sum(spend) as total_spend
  from public.campaigns;

create view public.channel_performance as
  select channel, count(*) as campaign_count,
    avg(roi) as avg_roi, avg(cac) as avg_cac,
    avg(conversion_rate) as avg_conversion_rate,
    100.0 * sum(case when is_successful then 1 else 0 end)::numeric / nullif(count(*),0) as success_rate_pct
  from public.campaigns group by channel;

-- RLS
alter table public.campaigns enable row level security;
alter table public.predictions enable row level security;
create policy "campaigns_select" on public.campaigns for select using (true);
create policy "predictions_select" on public.predictions for select using (true);
create policy "predictions_insert" on public.predictions for insert with check (true);
```

---

## Environment Variables

| Variable | Where used | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase anon key |
| `SUPABASE_URL` | API server | Supabase project URL |
| `SUPABASE_ANON_KEY` | API server | Supabase anon key |
| `VITE_CLERK_PUBLISHABLE_KEY` | Frontend | Clerk publishable key (auto-provisioned) |
| `CLERK_PUBLISHABLE_KEY` | API server | Clerk publishable key (auto-provisioned) |
| `CLERK_SECRET_KEY` | API server | Clerk secret key (auto-provisioned) |

---

## Local Development

```bash
# Install dependencies
pnpm install

# Run the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Run the frontend (separate terminal)
pnpm --filter @workspace/zebra run dev

# Regenerate API client after changing the OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Full typecheck
pnpm run typecheck
```

---

## Routes

| Path | Auth required | Description |
|---|---|---|
| `/` | No | Landing page (signed-out) / Dashboard (signed-in) |
| `/sign-in` | No | Clerk sign-in page |
| `/sign-up` | No | Clerk sign-up page |
| `/predict` | Yes | Campaign predictor |
| `/insights` | Yes | Model card & metrics |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Summary + channel performance + recent predictions |
| `GET` | `/api/predictions` | Last 10 saved predictions |
| `POST` | `/api/predictions` | Save a new prediction result |
| `GET` | `/api/healthz` | Health check |
