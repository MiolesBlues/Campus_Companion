# Campus Companion

Campus Companion is a Next.js web app designed to help students navigate campus life with quick access to events, timetables, locations, support services, and account-based features.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + PostgreSQL)

## Current Features
- Home dashboard with quick links
- Events page with category filtering and date sorting
- Timetables page with course and year filtering
- Campus locations directory
- Helpdesk form with client-side submission feedback
- Login / signup pages prepared for Supabase Auth
- Account page with user/admin role visibility
- Skip-to-content accessibility link

## Project Rules
- Use **fictional data only**
- Do **not** use generative AI for the design report
- Keep prompt logs for AI-assisted app and ML work

## Environment Variables
Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

A starter example is provided in `.env.example`.

## Supabase Setup
1. Create a new Supabase project.
2. Open the SQL Editor in Supabase.
3. Run the file at `supabase/schema.sql`.
4. In Supabase Authentication, configure your site URL and email settings.
5. Copy your project URL and anon key into `.env.local`.
6. Install dependencies and run the app.

### What the SQL setup includes
- `profiles` table linked to `auth.users`
- `events`
- `event_tags`
- `locations`
- `timetables`
- `helpdesk_tickets`
- `announcements`
- row-level security policies
- two roles: `user` and `admin`
- trigger to create a profile automatically when a user signs up
- large starter seed dataset for events, locations, timetables, and announcements

### Admin access
Users sign up with the default role `user`.
To promote someone to admin, update their profile row in Supabase:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

## Getting Started
Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open <http://localhost:3000> in your browser.

## Suggested Folder Structure
```text
src/
  app/
  components/
  lib/
  types/
supabase/
```

## Deployment Notes
- Deploy on Netlify
- Connect the GitHub repo to Netlify for automatic deploys on push
- Add the same Supabase environment variables in Netlify project settings
- If you later use server-side auth helpers, also document those variables here before deployment
