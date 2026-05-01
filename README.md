# Campus Companion

Campus Companion is a Next.js web app designed to help students and teachers navigate campus life with quick access to events, timetables, locations, societies, support services, and account-based features.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + PostgreSQL)

## Current Features
- Home dashboard with quick links
- Events page with category filtering and date sorting
- Timetables page with course and year filtering
- Automatic student timetable selection based on account profile
- Teacher timetable support
- Campus locations directory
- Database-backed societies list for signup and account editing
- Helpdesk form with client-side submission feedback
- Login / signup pages prepared for Supabase Auth
- Account page with role visibility and editable student profile fields
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
- `societies`
- `events`
- `event_tags`
- `locations`
- `timetables`
- `helpdesk_tickets`
- `announcements`
- row-level security policies
- three roles: `student`, `teacher`, and `admin`
- trigger to create a profile automatically when a user signs up
- automatic student year-of-study sync based on academic start year
- profile societies stored as selected society IDs + names
- large starter seed dataset for societies, events, locations, student timetables, teacher timetables, and announcements

### Roles and access
- New signups default to `student`
- Only admins should grant `teacher` or `admin`
- Teachers can see their own timetable
- Admins can manage role changes in Supabase

To promote someone to admin:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

To grant teacher access:

```sql
update public.profiles
set role = 'teacher'
where email = 'teacher@example.com';
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

## Product Planning Docs
- Personalization / user-data expansion plan: `docs/user-personalization-plan.md`

## Deployment Notes
- Deploy on Netlify
- Connect the GitHub repo to Netlify for automatic deploys on push
- Add the same Supabase environment variables in Netlify project settings
- If you later use server-side auth helpers, also document those variables here before deployment
