# Campus Companion

A Next.js web app that helps students navigate campus life — events, timetables, locations, helpdesk tickets, and a Supabase-backed account system.

> **All data shown in the app is fictional.** No real student records, timetables, or contact details are used.

## Stack

- **Next.js 16** (App Router) with TypeScript and React 19
- **Tailwind CSS v4**
- **Supabase** — Postgres database and Auth (email/password)
- **Netlify** for deployment (static export, push-to-deploy from `main`)

## Features

| Feature | Path | Notes |
|---|---|---|
| Home dashboard | `/` | Welcome panel + quick links to the rest of the app |
| Events | `/events` | Filter by category, sort by date |
| Timetables | `/timetables` | Filter by course code and year of study |
| Locations | `/locations` | Directory of campus buildings and services |
| Helpdesk | `/helpdesk` | Submit a ticket (Wi-Fi, library access, room access, ID card, timetable, IT) |
| Account | `/account` | Shows the signed-in user's profile and role |
| Login / Signup | `/login`, `/signup` | Email + password via Supabase Auth |
| Skip-to-content | layout | Keyboard-accessible skip link in the header |

## Run locally

Prerequisites: Node.js 20+ and npm.

```bash
git clone https://github.com/MiolesBlues/Campus_Companion.git
cd Campus_Companion
npm install
cp .env.example .env.local        # then paste your Supabase URL + anon key
# seed: open supabase/schema.sql in the Supabase SQL Editor and run it
npm run dev                       # http://localhost:3000
```

Other scripts:

```bash
npm run lint                      # eslint
npm run build                     # production build (next build → static export to /out)
npm run start                     # serve a previously-built app
```

## Environment variables

Set these in `.env.local` (local) and in Netlify's site settings (production):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL, e.g. `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key from Supabase project settings (API) |

The anon key is safe to expose in the browser — Row Level Security in `supabase/schema.sql` controls what it can read or write.

A starter template is in `.env.example`.

## Database

The full schema lives in `supabase/schema.sql`. Run it once in the Supabase **SQL Editor** to create tables, RLS policies, the auth-trigger that auto-creates a profile row when a user signs up, and a starter seed of events / locations / timetables / announcements.

Tables:

- `profiles` — linked 1:1 to `auth.users`. Holds `role` (`user` | `admin`), `full_name`, `student_id`, `course`, `year_of_study`.
- `events` — title, category, description, location, date/time, audience, capacity.
- `event_tags` — many-to-one to `events`.
- `locations` — building/service directory with opening hours and accessibility notes.
- `timetables` — per-course weekly schedule with module, lecturer, room, building, delivery mode.
- `helpdesk_tickets` — owned by a profile, with category, urgency, status, optional admin notes.
- `announcements` — global notices, scoped by `audience`.

### Roles

New signups default to `role = 'user'`. To promote a teammate to admin, run this in Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

## Deploy to Netlify

The app is configured for **static export** (`next.config.ts` sets `output: "export"`), so Netlify serves the prebuilt `/out` directory.

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import from Git → pick this repo**.
3. Build settings (Netlify will pick these up from `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `out`
4. Add the two `NEXT_PUBLIC_SUPABASE_*` variables in **Site settings → Environment variables**.
5. Trigger a deploy. Subsequent pushes to `main` deploy automatically.

## Project layout

```text
src/
  app/              # App Router pages (events, timetables, locations, helpdesk, account, login, signup)
  components/       # Auth UI (auth-form, auth-provider, auth-status)
  data/             # Fictional JSON seeds (events, locations, timetables, helpdesk-categories)
  lib/supabase/     # Supabase client setup
  types/            # Shared TypeScript types
supabase/
  schema.sql        # Tables, RLS, signup trigger, seed data
```

## Project rules

- **Fictional data only** — never paste real student records, names, or contact details into the app or seed files.
- **No generative AI for the design report** (per the assignment brief). AI-assisted app/ML work is fine but prompt logs must be kept.
