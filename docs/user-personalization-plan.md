# Campus Companion - User Personalization Plan

This document defines a practical user-information expansion plan for Campus Companion.

The goal is to collect **useful, non-creepy** profile data that directly improves:
- timetable relevance
- event recommendations
- society recommendations
- campus-specific routing
- support/helpdesk context
- overall student portal usefulness

---

## 1. Design Principles

### Collect only data with a clear product use
If we cannot answer **"Where will this be used in the app?"**, we should not collect it.

### Keep signup light
Signup should stay focused on core onboarding.
Optional enrichment belongs mostly in the Account page.

### Prefer structured data over free text where possible
Use select fields and multi-select tags for:
- interests
- preferred categories
- availability
- career goals

That makes filtering and recommendation logic much easier.

### Use personalization to reduce noise
The purpose is not to store personal data for its own sake.
The purpose is to:
- show more relevant events
- suggest better societies
- auto-select timetable filters
- improve helpdesk context

---

## 2. Recommended New Profile Fields

## Phase 1 - High-value fields
These provide the best value quickly.

### `academic_group`
Type: `text`

Why:
- lets timetable auto-select a group
- helps resolve parallel timetable group issues
- improves timetable landing experience

Used in:
- Timetables page
- Signup
- Account page

---

### `interests`
Type: `jsonb`, default `[]`

Suggested values:
- Technology
- Careers
- Sports
- Music
- Arts
- Gaming
- Business
- Wellbeing
- Volunteering
- Academic Support
- International Community
- Entrepreneurship

Why:
- powers event recommendations
- powers society suggestions
- improves home page relevance

Used in:
- Home page
- Events page
- Societies page
- Account page

---

### `preferred_event_categories`
Type: `jsonb`, default `[]`

Why:
- lets users tell the app what they want to see more of
- improves events ordering and "recommended for you"

Used in:
- Events page
- Home page
- future notifications/reminders

---

### `preferred_society_categories`
Type: `jsonb`, default `[]`

Why:
- helps suggest the most relevant societies
- useful for new students who do not know where to start

Used in:
- Societies page
- Home page
- Account page

---

## Phase 2 - Strong optional fields
These are useful but not required for the first personalization pass.

### `career_interest`
Type: `text`

Suggested values:
- Software Engineering
- Data / AI
- Cybersecurity
- Marketing
- Finance
- Entrepreneurship
- Teaching
- Research
- Not sure yet

Used in:
- Events recommendations
- Careers-related home blocks
- job fair/workshop prioritization

---

### `availability_preferences`
Type: `jsonb`, default `[]`

Suggested values:
- Monday Evening
- Tuesday Afternoon
- Weekend
- Morning Events
- Evening Events

Used in:
- future event filtering
- future recommendation ranking

---

### `accessibility_preferences`
Type: `text` or `jsonb`

Examples:
- step-free preferred
- quiet spaces preferred
- accessible toilets needed nearby

Used in:
- locations relevance
- helpdesk context
- support routing

---

## 3. Where Each Field Should Be Used

## Timetables Page
Use:
- course
- year_of_study
- campus
- `academic_group`

Behavior:
- auto-select course/year/group for students
- still allow manual override
- if no exact group match exists, fall back gracefully

Future enhancement:
- group badge in profile header

---

## Events Page
Use:
- campus
- interests
- preferred_event_categories
- career_interest
- availability_preferences (future)

Behavior:
- add a **Recommended for you** sort/section
- rank matching events higher when category aligns with preferences
- show campus-relevant events higher
- optionally add a small "Matches your interests" badge

Possible recommendation rules:
1. same campus
2. category matches preferred event categories
3. category aligns with interests
4. category aligns with career interest

---

## Societies Page
Use:
- interests
- preferred_society_categories
- course
- campus

Behavior:
- show suggested societies first
- show badges like:
  - Matches your interests
  - Popular for your course
  - Good for your campus

Possible recommendation rules:
1. same category as preferred society category
2. same category as interests
3. same campus if societies later become campus-aware

---

## Home Page
Use:
- interests
- preferred event categories
- preferred society categories
- campus
- academic group
- registered events

Behavior:
- keep home page clean, but allow **small personalized blocks**:
  - Recommended events
  - Suggested societies
  - Your timetable shortcut
  - Campus quick links

Recommended future home sections:
- Recommended for you
- Your campus this week
- Continue where you left off

---

## Account Page
Use:
- as the main place to edit personalization settings

Recommended sections:
1. Academic profile
2. Interests & preferences
3. Career goals
4. Joined societies
5. Registered events

This page should become the control panel for personalization.

---

## Helpdesk
Use:
- campus
- course
- year
- accessibility preferences

Behavior:
- prefill support context
- route to the correct support area
- improve admin view later

---

## 4. Recommended Database Changes

Add these fields to `public.profiles`.

```sql
alter table public.profiles
add column if not exists academic_group text,
add column if not exists interests jsonb not null default '[]'::jsonb,
add column if not exists preferred_event_categories jsonb not null default '[]'::jsonb,
add column if not exists preferred_society_categories jsonb not null default '[]'::jsonb,
add column if not exists career_interest text,
add column if not exists availability_preferences jsonb not null default '[]'::jsonb,
add column if not exists accessibility_preferences text;
```

### Type expectations
- `academic_group`: simple string like `Group 1`
- `interests`: array of strings
- `preferred_event_categories`: array of strings
- `preferred_society_categories`: array of strings
- `career_interest`: single string for now
- `availability_preferences`: array of strings
- `accessibility_preferences`: text for now

---

## 5. Required Type Updates

Update `src/types/database.ts` profile type with:
- `academic_group?: string | null`
- `interests?: string[] | null`
- `preferred_event_categories?: string[] | null`
- `preferred_society_categories?: string[] | null`
- `career_interest?: string | null`
- `availability_preferences?: string[] | null`
- `accessibility_preferences?: string | null`

---

## 6. Recommended UI Changes

## Signup
Keep signup short.

### Add during signup
Required:
- full name
- course
- campus
- year
- academic start year

Optional but valuable:
- academic group
- 3-5 interests

### Do NOT add everything during signup
Avoid putting all preference fields in signup.
That would make onboarding too heavy.

---

## Account Page
Add a new section:

### Interests & Preferences
Fields:
- academic group
- interests
- preferred event categories
- preferred society categories
- career interest
- availability preferences
- accessibility preferences

This should be the main editor for personalization.

---

## 7. Recommendation Logic - First Version

Keep it simple and transparent.

## Event recommendation score
Example scoring:
- +3 if event campus matches user campus
- +3 if event category is in preferred event categories
- +2 if event category overlaps with interests
- +2 if event category aligns with career interest

Sort recommended events by score, then by nearest date.

---

## Society recommendation score
Example scoring:
- +3 if society category is in preferred society categories
- +2 if society category overlaps with interests
- +1 if society is popular or featured later

Sort suggested societies by score, then by name.

---

## 8. Proposed Implementation Order

## Step 1 - Schema + types
- add new profile columns to `supabase/schema.sql`
- update `src/types/database.ts`
- update profile selects/updates

## Step 2 - Signup
- add `academic_group`
- add lightweight interests selection
- save to Supabase auth metadata + profile trigger path

## Step 3 - Account page
- add editable preferences section
- allow updating all personalization fields

## Step 4 - Timetable improvements
- auto-select `academic_group`
- keep fallback behavior if no exact group exists

## Step 5 - Event personalization
- add recommended ordering/section
- add matching badges

## Step 6 - Society personalization
- add suggested societies section
- add "why this matches" signals

## Step 7 - Home page personalization
- add a small recommended content block
- keep page clean, not overcrowded

---

## 9. Concrete Feature Scope for Next Coding Pass

For the next implementation pass, the recommended scope is:

### Add now
- `academic_group`
- `interests`
- `preferred_event_categories`

### Wire into
- Signup form
- Account page
- Timetables page auto-filter
- Events page recommendations

This gives the best balance of:
- useful personalization
- manageable complexity
- visible user benefit

---

## 10. Notes for Safety and UX

### Avoid over-collection
Do not ask for personal data that does not improve the product.

### Keep explanations clear
When asking for interests/preferences, explain why:
- "Used to recommend events and societies for you"

### Prefer editable preferences over hidden inference
Users should be able to see and change what the app thinks they like.

---

## 11. Final Recommendation

The best immediate personalization upgrade for Campus Companion is:

1. add `academic_group`
2. add `interests`
3. add `preferred_event_categories`
4. use them in:
   - Timetables
   - Events
   - Home page

That will make the app feel much more like a real student portal and much less like a static campus brochure with login.
