-- Campus Companion Supabase schema
-- Run this in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text not null,
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  student_id text unique,
  course text,
  year_of_study integer check (year_of_study between 1 and 6),
  start_year integer check (start_year between 2010 and 2100),
  societies jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.societies (
  id bigserial primary key,
  name text not null unique,
  category text not null,
  description text not null,
  contact_email text,
  meeting_day text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id bigserial primary key,
  title text not null,
  category text not null,
  description text not null,
  location text not null,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  audience text not null default 'all',
  capacity integer,
  published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_tags (
  id bigserial primary key,
  event_id bigint not null references public.events(id) on delete cascade,
  tag text not null,
  unique (event_id, tag)
);

create table if not exists public.locations (
  id bigserial primary key,
  name text not null,
  type text not null,
  description text not null,
  building_code text,
  opening_hours text,
  accessibility_notes text,
  contact_email text,
  contact_phone text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timetables (
  id bigserial primary key,
  course_code text not null,
  course_name text not null,
  year_of_study integer check (year_of_study between 1 and 6),
  semester integer not null check (semester in (1, 2)),
  day_of_week text not null check (day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
  module_code text not null,
  module_name text not null,
  lecturer_name text not null,
  lecturer_email text,
  room text not null,
  building text not null,
  start_time time not null,
  end_time time not null,
  delivery_mode text not null default 'In Person' check (delivery_mode in ('In Person', 'Online', 'Hybrid')),
  owner_role text not null default 'student' check (owner_role in ('student', 'teacher')),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.helpdesk_tickets (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  urgency text not null check (urgency in ('low', 'medium', 'high')),
  subject text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to uuid references public.profiles(id) on delete set null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id bigserial primary key,
  title text not null,
  body text not null,
  audience text not null default 'all',
  published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.calculate_year_of_study(profile_start_year integer)
returns integer
language plpgsql
stable
as $$
declare
  current_year integer := extract(year from now());
  current_month integer := extract(month from now());
  calculated_year integer;
begin
  if profile_start_year is null then
    return null;
  end if;

  if current_month >= 8 then
    calculated_year := current_year - profile_start_year + 1;
  else
    calculated_year := current_year - profile_start_year;
  end if;

  return greatest(1, calculated_year);
end;
$$;

create or replace function public.sync_profile_year_of_study()
returns trigger
language plpgsql
as $$
begin
  if new.role = 'student' and new.start_year is not null then
    new.year_of_study := public.calculate_year_of_study(new.start_year);
  end if;
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, course, year_of_study, start_year, societies)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    new.raw_user_meta_data ->> 'course',
    coalesce((new.raw_user_meta_data ->> 'year_of_study')::integer, 1),
    coalesce((new.raw_user_meta_data ->> 'start_year')::integer, extract(year from now())::integer),
    coalesce((new.raw_user_meta_data -> 'societies')::jsonb, '[]'::jsonb)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists profiles_sync_year on public.profiles;
create trigger profiles_sync_year before insert or update on public.profiles
for each row execute procedure public.sync_profile_year_of_study();

drop trigger if exists societies_set_updated_at on public.societies;
create trigger societies_set_updated_at before update on public.societies
for each row execute procedure public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before update on public.events
for each row execute procedure public.set_updated_at();

drop trigger if exists locations_set_updated_at on public.locations;
create trigger locations_set_updated_at before update on public.locations
for each row execute procedure public.set_updated_at();

drop trigger if exists timetables_set_updated_at on public.timetables;
create trigger timetables_set_updated_at before update on public.timetables
for each row execute procedure public.set_updated_at();

drop trigger if exists helpdesk_tickets_set_updated_at on public.helpdesk_tickets;
create trigger helpdesk_tickets_set_updated_at before update on public.helpdesk_tickets
for each row execute procedure public.set_updated_at();

drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at before update on public.announcements
for each row execute procedure public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.societies enable row level security;
alter table public.events enable row level security;
alter table public.event_tags enable row level security;
alter table public.locations enable row level security;
alter table public.timetables enable row level security;
alter table public.helpdesk_tickets enable row level security;
alter table public.announcements enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (auth.uid() = id or public.is_admin())
with check (
  (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()))
  or public.is_admin()
);

create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id or public.is_admin());

create policy "societies_read_published"
on public.societies
for select
using (published = true or public.is_admin());

create policy "societies_admin_all"
on public.societies
for all
using (public.is_admin())
with check (public.is_admin());

create policy "events_read_published"
on public.events
for select
using (published = true or public.is_admin());

create policy "events_admin_all"
on public.events
for all
using (public.is_admin())
with check (public.is_admin());

create policy "event_tags_read_all"
on public.event_tags
for select
using (true);

create policy "event_tags_admin_all"
on public.event_tags
for all
using (public.is_admin())
with check (public.is_admin());

create policy "locations_read_published"
on public.locations
for select
using (published = true or public.is_admin());

create policy "locations_admin_all"
on public.locations
for all
using (public.is_admin())
with check (public.is_admin());

create policy "timetables_read_published"
on public.timetables
for select
using (
  published = true
  or public.is_admin()
  or (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'teacher'
      and email = public.timetables.lecturer_email
    )
  )
);

create policy "timetables_admin_all"
on public.timetables
for all
using (public.is_admin())
with check (public.is_admin());

create policy "tickets_user_read_own_or_admin"
on public.helpdesk_tickets
for select
using (auth.uid() = user_id or public.is_admin());

create policy "tickets_user_insert_own"
on public.helpdesk_tickets
for insert
with check (auth.uid() = user_id or public.is_admin());

create policy "tickets_user_update_own_or_admin"
on public.helpdesk_tickets
for update
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

create policy "announcements_read_published"
on public.announcements
for select
using (published = true or public.is_admin());

create policy "announcements_admin_all"
on public.announcements
for all
using (public.is_admin())
with check (public.is_admin());

insert into public.societies (name, category, description, contact_email, meeting_day, published)
values
('Computer Society', 'Technology', 'Coding nights, hackathons, and software project collaboration.', 'computing@campuscompanion.edu', 'Wednesday', true),
('Drama Society', 'Arts', 'Theatre workshops, auditions, and live productions.', 'drama@campuscompanion.edu', 'Thursday', true),
('Basketball Club', 'Sports', 'Training sessions, intervarsity prep, and casual games.', 'basketball@campuscompanion.edu', 'Tuesday', true),
('Debate Society', 'Academic', 'Debates, public speaking events, and competitions.', 'debate@campuscompanion.edu', 'Monday', true),
('Music Society', 'Arts', 'Band practice, open mic nights, and live performances.', 'music@campuscompanion.edu', 'Friday', true),
('Entrepreneurship Society', 'Business', 'Startup meetups, founder talks, and pitch practice.', 'startup@campuscompanion.edu', 'Wednesday', true),
('Gaming Society', 'Social', 'Esports, board game nights, and casual tournaments.', 'gaming@campuscompanion.edu', 'Saturday', true),
('International Students Society', 'Community', 'Meetups, support, and cross-cultural events.', 'international@campuscompanion.edu', 'Thursday', true),
('Photography Club', 'Creative', 'Campus photo walks, editing sessions, and exhibitions.', 'photo@campuscompanion.edu', 'Monday', true),
('Volunteering Society', 'Community', 'Charity work, local outreach, and service projects.', 'volunteer@campuscompanion.edu', 'Tuesday', true),
('Cybersecurity Society', 'Technology', 'CTF practice, security talks, and lab sessions.', 'cyber@campuscompanion.edu', 'Friday', true),
('Dance Society', 'Arts', 'Group rehearsals, showcases, and beginner-friendly classes.', 'dance@campuscompanion.edu', 'Wednesday', true)
on conflict (name) do nothing;

insert into public.events (title, category, description, location, event_date, start_time, end_time, audience, capacity, published)
values
('Welcome Week Tech Meetup', 'Technology', 'Meet students interested in software, AI, and startups.', 'Innovation Hub', '2026-09-07', '14:00', '16:00', 'all', 120, true),
('Careers CV Workshop', 'Careers', 'Improve your CV and prepare for internship season.', 'Library Seminar Room', '2026-09-08', '11:00', '12:30', 'all', 80, true),
('Campus Football Social', 'Sports', 'Casual football session to meet classmates and stay active.', 'Sports Centre', '2026-09-09', '16:30', '18:00', 'all', 40, true),
('Exam Wellbeing Session', 'Wellness', 'Breathing, mindfulness, and stress management for exam season.', 'Wellness Centre', '2026-09-10', '13:00', '14:00', 'all', 60, true),
('Cultural Food Festival', 'Cultural', 'Food, music, and stories from student communities.', 'PE Hall', '2026-09-11', '12:00', '15:00', 'all', 250, true),
('Board Games Night', 'Social', 'Snacks, games, and chilled student vibes.', 'Student Union Lounge', '2026-09-12', '19:00', '21:30', 'all', 70, true),
('Academic Writing Workshop', 'Academic', 'Essay writing, structure, referencing, and clarity tips.', 'T-Main-001', '2026-09-14', '15:00', '16:30', 'all', 90, true),
('Study Skills for Exams', 'Academic', 'Revision planning and effective study habits.', 'T-Main-005', '2026-09-15', '12:00', '13:00', 'all', 85, true),
('Running Club Beginners', 'Sports', 'Friendly morning run open to all fitness levels.', 'Campus Track', '2026-09-16', '08:00', '09:00', 'all', 30, true),
('Graduate Recruitment Fair', 'Careers', 'Meet recruiters from leading employers.', 'Main Hall', '2026-09-17', '10:00', '14:00', 'all', 300, true),
('AI and Machine Learning Talk', 'Technology', 'Industry speaker on real-world AI applications.', 'T-North-204', '2026-09-18', '13:00', '14:30', 'all', 140, true),
('LinkedIn Profile Workshop', 'Careers', 'Build a strong profile for internships and graduate roles.', 'Main Hall', '2026-09-19', '14:00', '15:30', 'all', 100, true),
('Basketball Beginners', 'Sports', 'Casual basketball session open to all students.', 'Sports Hall', '2026-09-21', '17:00', '18:30', 'all', 35, true),
('International Music Night', 'Cultural', 'Live performances representing cultures from around the world.', 'Student Union Hall', '2026-09-22', '19:00', '21:00', 'all', 220, true),
('Quiz Night Challenge', 'Social', 'Team-based trivia night with prizes.', 'Student Union Hall', '2026-09-23', '19:30', '21:30', 'all', 90, true),
('Robotics Demo Day', 'Technology', 'Student teams showcase robotics projects.', 'Engineering Lab-003', '2026-09-24', '13:00', '15:00', 'all', 110, true),
('Time Management Workshop', 'Academic', 'Practical planning for assignments and deadlines.', 'T-Main-201', '2026-09-25', '12:00', '13:00', 'all', 75, true),
('Cybersecurity Awareness Talk', 'Technology', 'Practical cybersecurity tips for students.', 'T-North-102', '2026-09-26', '13:00', '14:00', 'all', 100, true),
('Healthy Eating for Students', 'Wellness', 'Nutrition advice for busy student life.', 'Health Centre', '2026-09-28', '11:30', '12:30', 'all', 50, true),
('Mock Interview Practice', 'Careers', 'Practice interviews with advisor feedback.', 'Careers Office', '2026-09-29', '15:00', '17:00', 'all', 45, true),
('Societies Showcase Fair', 'Social', 'Meet clubs and societies and sign up for the semester.', 'Student Union Hall', '2026-09-30', '12:00', '15:00', 'all', 180, true)
on conflict do nothing;

insert into public.locations (name, type, description, building_code, opening_hours, accessibility_notes, contact_email, contact_phone, published)
values
('Main Library', 'Library', 'Primary study and research space with silent zones and group rooms.', 'LIB', 'Mon-Fri 08:00-22:00, Sat-Sun 10:00-18:00', 'Lift access and accessible study desks available.', 'library@campuscompanion.edu', '+353100000001', true),
('Innovation Hub', 'Study Space', 'Collaborative innovation and startup workspace.', 'IH', 'Mon-Fri 09:00-20:00', 'Step-free access and accessible toilets.', 'innovation@campuscompanion.edu', '+353100000002', true),
('Student Union Office', 'Support Service', 'Student activities, clubs, and representation support.', 'SU', 'Mon-Fri 09:00-17:00', 'Ground-floor access available.', 'su@campuscompanion.edu', '+353100000003', true),
('Careers Office', 'Support Service', 'Career guidance, CV reviews, and employer events.', 'CO', 'Mon-Fri 09:00-17:00', 'Accessible entrance and seating.', 'careers@campuscompanion.edu', '+353100000004', true),
('Wellness Centre', 'Health Service', 'Mental health and wellbeing support for students.', 'WC', 'Mon-Fri 08:30-17:30', 'Private accessible consultation rooms.', 'wellness@campuscompanion.edu', '+353100000005', true),
('Sports Centre', 'Sports Facility', 'Indoor sports, gym access, and student training sessions.', 'SC', 'Mon-Fri 07:00-22:00, Sat 09:00-18:00', 'Accessible changing rooms available.', 'sports@campuscompanion.edu', '+353100000006', true),
('Engineering Block', 'Academic Building', 'Lecture halls and labs for computing and engineering.', 'ENG', 'Mon-Fri 08:00-20:00', 'Lift access to all floors.', 'eng-office@campuscompanion.edu', '+353100000007', true),
('Business School', 'Academic Building', 'Teaching space for business, finance, and marketing.', 'BUS', 'Mon-Fri 08:00-19:00', 'Step-free entrance and hearing loop in main rooms.', 'business@campuscompanion.edu', '+353100000008', true),
('Science Centre', 'Academic Building', 'Teaching labs and classrooms for science modules.', 'SCI', 'Mon-Fri 08:00-19:00', 'Lift access and lab bench accessibility support.', 'science@campuscompanion.edu', '+353100000009', true),
('Health Centre', 'Health Service', 'Basic medical advice and student health support.', 'HC', 'Mon-Fri 09:00-17:00', 'Accessible treatment room and ramps.', 'health@campuscompanion.edu', '+353100000010', true),
('North Lecture Theatre', 'Lecture Hall', 'Large lecture theatre for major talks and classes.', 'NLT', 'Mon-Fri 08:00-18:00', 'Wheelchair spaces in front and rear rows.', 'rooms@campuscompanion.edu', '+353100000011', true),
('Student Union Hall', 'Event Space', 'Large hall for festivals, quiz nights, and society events.', 'SUH', 'Mon-Sun 10:00-22:00', 'Accessible entrance and accessible toilets.', 'events@campuscompanion.edu', '+353100000012', true)
on conflict do nothing;

insert into public.timetables (course_code, course_name, year_of_study, semester, day_of_week, module_code, module_name, lecturer_name, lecturer_email, room, building, start_time, end_time, delivery_mode, owner_role, published)
values
('CS', 'Computer Science', 1, 1, 'Monday', 'CS101', 'Introduction to Programming', 'Dr. Ryan', 'dr.ryan@campuscompanion.edu', 'E201', 'Engineering Block', '09:00', '10:30', 'In Person', 'student', true),
('CS', 'Computer Science', 1, 1, 'Monday', 'MA101', 'Discrete Mathematics', 'Prof. Walsh', 'prof.walsh@campuscompanion.edu', 'S104', 'Science Centre', '11:00', '12:30', 'In Person', 'student', true),
('CS', 'Computer Science', 1, 1, 'Tuesday', 'CS103', 'Computer Systems', 'Dr. Doyle', 'dr.doyle@campuscompanion.edu', 'E105', 'Engineering Block', '10:00', '11:30', 'In Person', 'student', true),
('CS', 'Computer Science', 1, 1, 'Wednesday', 'CS104', 'Web Development Lab', 'Ms. Keane', 'ms.keane@campuscompanion.edu', 'Lab 2', 'Tech Lab', '14:00', '16:00', 'In Person', 'student', true),
('CS', 'Computer Science', 1, 1, 'Thursday', 'CS105', 'Databases Fundamentals', 'Mr. Ahmed', 'mr.ahmed@campuscompanion.edu', 'I110', 'ICT Building', '13:00', '14:30', 'Hybrid', 'student', true),
('CS', 'Computer Science', 1, 1, 'Friday', 'CS106', 'Professional Skills', 'Ms. Murphy', 'ms.murphy@campuscompanion.edu', 'E010', 'Engineering Block', '10:00', '11:00', 'In Person', 'student', true),
('CS', 'Computer Science', 2, 1, 'Monday', 'CS201', 'Data Structures', 'Dr. Byrne', 'dr.byrne@campuscompanion.edu', 'E305', 'Engineering Block', '10:00', '11:30', 'In Person', 'student', true),
('CS', 'Computer Science', 2, 1, 'Tuesday', 'CS202', 'Object Oriented Programming', 'Dr. Ryan', 'dr.ryan@campuscompanion.edu', 'E302', 'Engineering Block', '09:00', '10:30', 'In Person', 'student', true),
('CS', 'Computer Science', 2, 1, 'Wednesday', 'CS203', 'Database Systems', 'Mr. Ahmed', 'mr.ahmed@campuscompanion.edu', 'I210', 'ICT Building', '13:00', '14:30', 'Hybrid', 'student', true),
('CS', 'Computer Science', 2, 1, 'Thursday', 'CS204', 'Networks', 'Dr. Kelly', 'dr.kelly@campuscompanion.edu', 'N102', 'North Block', '11:00', '12:30', 'In Person', 'student', true),
('CS', 'Computer Science', 2, 1, 'Friday', 'CS205', 'Software Engineering', 'Prof. Walsh', 'prof.walsh@campuscompanion.edu', 'E401', 'Engineering Block', '15:00', '16:30', 'In Person', 'student', true),
('BUS', 'Business', 1, 1, 'Monday', 'BU101', 'Principles of Marketing', 'Dr. Murphy', 'dr.murphy@campuscompanion.edu', 'B101', 'Business School', '10:00', '11:30', 'In Person', 'student', true),
('BUS', 'Business', 1, 1, 'Tuesday', 'BU102', 'Business Communication', 'Ms. Nolan', 'ms.nolan@campuscompanion.edu', 'B203', 'Business School', '09:00', '10:30', 'In Person', 'student', true),
('BUS', 'Business', 1, 1, 'Wednesday', 'BU103', 'Economics for Business', 'Dr. Lane', 'dr.lane@campuscompanion.edu', 'B210', 'Business School', '12:00', '13:30', 'In Person', 'student', true),
('BUS', 'Business', 1, 1, 'Thursday', 'BU104', 'Accounting Basics', 'Mr. O''Connell', 'mr.oconnell@campuscompanion.edu', 'B115', 'Business School', '14:00', '15:30', 'In Person', 'student', true),
('BUS', 'Business', 1, 1, 'Friday', 'BU105', 'Business Analytics', 'Ms. Reid', 'ms.reid@campuscompanion.edu', 'B118', 'Business School', '11:00', '12:30', 'Hybrid', 'student', true),
('BUS', 'Business', 2, 1, 'Monday', 'BU201', 'Financial Accounting', 'Mr. O''Connell', 'mr.oconnell@campuscompanion.edu', 'B115', 'Business School', '12:00', '13:30', 'In Person', 'student', true),
('BUS', 'Business', 2, 1, 'Tuesday', 'BU202', 'Project Management', 'Dr. Smith', 'dr.smith@campuscompanion.edu', 'H12', 'Innovation Hub', '15:00', '16:30', 'In Person', 'student', true),
('BUS', 'Business', 2, 1, 'Wednesday', 'BU203', 'Organisational Behaviour', 'Dr. Murphy', 'dr.murphy@campuscompanion.edu', 'B220', 'Business School', '10:00', '11:30', 'In Person', 'student', true),
('BUS', 'Business', 2, 1, 'Thursday', 'BU204', 'Digital Marketing', 'Ms. Nolan', 'ms.nolan@campuscompanion.edu', 'B202', 'Business School', '09:00', '10:30', 'In Person', 'student', true),
('BUS', 'Business', 2, 1, 'Friday', 'BU205', 'Entrepreneurship', 'Dr. Lane', 'dr.lane@campuscompanion.edu', 'IH-03', 'Innovation Hub', '13:00', '14:30', 'Hybrid', 'student', true),
('ENG', 'Engineering', 1, 1, 'Monday', 'EN101', 'Engineering Mathematics', 'Prof. Keating', 'prof.keating@campuscompanion.edu', 'E101', 'Engineering Block', '09:00', '10:30', 'In Person', 'student', true),
('ENG', 'Engineering', 1, 1, 'Tuesday', 'EN102', 'Mechanics', 'Dr. Byrne', 'dr.byrne@campuscompanion.edu', 'E204', 'Engineering Block', '11:00', '12:30', 'In Person', 'student', true),
('ENG', 'Engineering', 1, 1, 'Wednesday', 'EN103', 'Materials Science', 'Dr. Shaw', 'dr.shaw@campuscompanion.edu', 'S205', 'Science Centre', '14:00', '15:30', 'In Person', 'student', true),
('ENG', 'Engineering', 1, 1, 'Thursday', 'EN104', 'CAD Fundamentals', 'Ms. Nolan', 'ms.nolan@campuscompanion.edu', 'Lab 4', 'Engineering Block', '10:00', '12:00', 'In Person', 'student', true),
('ENG', 'Engineering', 1, 1, 'Friday', 'EN105', 'Engineering Design', 'Prof. Keating', 'prof.keating@campuscompanion.edu', 'E301', 'Engineering Block', '13:00', '14:30', 'In Person', 'student', true),
('ENG', 'Engineering', 2, 1, 'Monday', 'EN201', 'Thermodynamics', 'Dr. Shaw', 'dr.shaw@campuscompanion.edu', 'E208', 'Engineering Block', '13:00', '14:30', 'In Person', 'student', true),
('ENG', 'Engineering', 2, 1, 'Tuesday', 'EN202', 'Fluid Mechanics', 'Dr. Doyle', 'dr.doyle@campuscompanion.edu', 'E210', 'Engineering Block', '09:00', '10:30', 'In Person', 'student', true),
('ENG', 'Engineering', 2, 1, 'Wednesday', 'EN203', 'Electrical Principles', 'Ms. Reid', 'ms.reid@campuscompanion.edu', 'E112', 'Engineering Block', '11:00', '12:30', 'In Person', 'student', true),
('ENG', 'Engineering', 2, 1, 'Thursday', 'EN204', 'Control Systems', 'Dr. Ryan', 'dr.ryan@campuscompanion.edu', 'E405', 'Engineering Block', '14:00', '15:30', 'Hybrid', 'student', true),
('ENG', 'Engineering', 2, 1, 'Friday', 'EN205', 'Engineering Project Lab', 'Mr. Ahmed', 'mr.ahmed@campuscompanion.edu', 'Lab 7', 'Engineering Block', '09:00', '11:00', 'In Person', 'student', true),
('STAFF', 'Teacher Timetable', null, 1, 'Monday', 'CS101', 'Introduction to Programming', 'Dr. Ryan', 'dr.ryan@campuscompanion.edu', 'E201', 'Engineering Block', '09:00', '10:30', 'In Person', 'teacher', true),
('STAFF', 'Teacher Timetable', null, 1, 'Tuesday', 'CS202', 'Object Oriented Programming', 'Dr. Ryan', 'dr.ryan@campuscompanion.edu', 'E302', 'Engineering Block', '09:00', '10:30', 'In Person', 'teacher', true),
('STAFF', 'Teacher Timetable', null, 1, 'Thursday', 'EN204', 'Control Systems', 'Dr. Ryan', 'dr.ryan@campuscompanion.edu', 'E405', 'Engineering Block', '14:00', '15:30', 'Hybrid', 'teacher', true),
('STAFF', 'Teacher Timetable', null, 1, 'Monday', 'MA101', 'Discrete Mathematics', 'Prof. Walsh', 'prof.walsh@campuscompanion.edu', 'S104', 'Science Centre', '11:00', '12:30', 'In Person', 'teacher', true),
('STAFF', 'Teacher Timetable', null, 1, 'Friday', 'CS205', 'Software Engineering', 'Prof. Walsh', 'prof.walsh@campuscompanion.edu', 'E401', 'Engineering Block', '15:00', '16:30', 'In Person', 'teacher', true)
on conflict do nothing;

insert into public.announcements (title, body, audience, published)
values
('Welcome to Semester 1', 'Check your timetable, register for events, and make sure your student ID is active.', 'all', true),
('Library Extended Hours', 'The main library will stay open later during revision week.', 'all', true),
('Admin Notice', 'This is a sample admin-only style content entry in the dataset.', 'admin', true)
on conflict do nothing;

insert into public.helpdesk_tickets (user_id, category, urgency, subject, description, status)
select id, 'IT Support', 'medium', 'Sample Laptop Wi-Fi Issue', 'Unable to connect to secure campus Wi-Fi after password reset.', 'open'
from public.profiles
limit 0;
