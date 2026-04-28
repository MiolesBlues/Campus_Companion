# Campus Companion App Build Plan

## Goal
Build a working **Campus Companion** app as fast as possible, with a scope small enough to finish cleanly before the deadline.

**Deadline:** 1/5/26 at 17:00  
**Team:** 5 people  
**Important:** Do **not** use generative AI for the **design report**. AI is fine for the **app build** and **ML feature** if you keep prompt logs.

---

## 1. What You Should Build First

Do not try to build everything.

### Required base app
Build these pages/features first:
1. **Home page**
2. **Events page**
3. **Campus locations page**
4. **One form page** → choose **Helpdesk**
5. **Accessibility settings**

That already gives you enough for:
- required app functionality
- accessibility testing
- user testing
- presentation demo
- ML integration later

---

## 2. Optional Features You Can Choose Later

Only add these if the base app is already working.

Choose from:
- Society events
- Lost & found
- Canteen menu
- Reminders / notifications
- Map view
- Authentication

**Rule:** optional means optional. Do not let extras delay the main build.

---

## 3. Best Simple Stack

Use the fastest safe setup:
- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **fictional JSON data in the repo**
- **Netlify** for deployment

For now, avoid making the project too heavy.

### Best practical choice
Start with:
- local JSON files for data
- no auth at first
- no database at first unless someone already knows Supabase well

You can always upgrade later if time allows.

---

## 4. Build Order

Follow this exact order.

### Step 1 — Project setup
One person should:
- create the repo
- create the Next.js app
- set up Tailwind
- push the first commit
- make sure everyone can pull the project

### Step 2 — App shell
Build:
- navbar
- footer or simple bottom area
- main layout
- home page structure

### Step 3 — Static data
Create fictional files like:
- `events.json`
- `locations.json`
- `helpdesk-categories.json`

### Step 4 — Core pages
Build these pages next:
- `/events`
- `/locations`
- `/helpdesk`
- `/settings` or accessibility controls in layout

### Step 5 — Styling and usability
Add:
- consistent colours
- buttons
- cards
- spacing
- mobile responsiveness
- loading/empty states if needed

### Step 6 — Accessibility basics
Add:
- clear headings
- form labels
- keyboard access
- visible focus styles
- good colour contrast
- text resize / high contrast toggle if possible

### Step 7 — ML feature
After the base app works, add a small feature like:
- recommended events
- similar events

### Step 8 — Deployment
Deploy to Netlify before final polish.

---

## 5. Recommended Team Split

## Person 1 — Setup + Repo + Deployment
Do:
- create repo
- create Next.js project
- handle branches/merges
- deploy to Netlify
- keep README updated

## Person 2 — Home + Layout + Styling
Do:
- homepage
- navbar/layout
- shared components
- consistent styling

## Person 3 — Events + Locations
Do:
- events page
- locations page
- cards, filters, data display

## Person 4 — Helpdesk + Data + ML
Do:
- helpdesk form
- fictional seed data
- ML recommender / similar events logic

## Person 5 — Accessibility + Testing + Prompt Logs
Do:
- accessibility settings
- WCAG checks
- user testing notes
- prompt transcript organisation

---

## 6. Minimum Page Plan

## Home page
Show:
- app title
- short welcome text
- quick links to main pages
- upcoming events preview
- featured location or help section

## Events page
Show:
- event cards
- event title
- date/time
- location
- category/tag
- optional filter by category

## Locations page
Show:
- building/location cards
- room/building name
- description
- opening hours
- accessibility notes

## Helpdesk page
Show a form with:
- issue category
- urgency
- short description
- submit button
- success message

## Accessibility settings
Include at least some of these:
- text size toggle
- high contrast mode
- reduced motion

---

## 7. Fictional Data You Need Right Now

Create these first:

### `events.json`
Each event should have:
- id
- title
- category
- date
- time
- location
- description
- tags

### `locations.json`
Each location should have:
- id
- name
- type
- description
- opening_hours
- accessibility_notes

### `helpdesk-categories.json`
Examples:
- Wi-Fi issue
- timetable problem
- room access issue
- library account issue
- ID card issue

If you want ML later, also create:
- `users-fictional.json`
- `interactions-fictional.json`

---

## 8. Best ML Feature to Add Later

Do **not** start with ML.
Start with the app.

### Best choice
Add a small **event recommender** after the events page is working.

### Simple version
Use fictional user interests and event tags.
Then recommend events based on matching categories or similarity scores.

Example:
- user likes `tech`, `careers`, `free events`
- event has matching tags
- show those events first

If you want a slightly better version:
- use cosine similarity or k-nearest neighbours

Keep it simple and explainable.

---

## 9. What To Do Today

### In the first hour
- agree the 4–5 core features
- assign the 5 roles
- create repo
- start Next.js app
- push first commit

### In the next 2–3 hours
- create layout
- create home page
- create JSON data files
- create events page
- create locations page

### After that
- build helpdesk form
- add accessibility settings
- polish styles
- test everything locally

### End of today target
By tonight you should have:
- app running
- navigation working
- 3 main pages built
- fictional data showing in UI
- first meaningful commits done

---

## 10. Git Plan

Keep it simple.

### Branch examples
- `main`
- `feature/home-page`
- `feature/events-page`
- `feature/locations-page`
- `feature/helpdesk-form`
- `feature/accessibility`
- `feature/ml`

### Good commit examples
- `init nextjs app`
- `add main layout and navigation`
- `add fictional events data`
- `build events page cards`
- `build locations page`
- `create helpdesk form`
- `add accessibility toggle`
- `deploy project to netlify`

---

## 11. Submission Safety Rules

### Rule 1
Do not use real data.

### Rule 2
Do not use AI for the design report.

### Rule 3
Keep prompt logs for app/ML work.

### Rule 4
Deploy before the last day.

### Rule 5
Do not waste time on optional features until the core app works.

---

## 12. Short Testing Plan

When the app works, test these tasks:
1. Find an upcoming event
2. Find a campus location
3. Submit a helpdesk issue

You need:
- 3 users
- task results
- notes on problems
- fixes made after testing

---

## 13. Short Final Checklist

- [ ] Next.js app runs locally
- [ ] Home page done
- [ ] Events page done
- [ ] Locations page done
- [ ] Helpdesk page done
- [ ] Accessibility settings added
- [ ] Fictional data only
- [ ] Prompt logs saved
- [ ] Netlify deployment works
- [ ] ML feature added
- [ ] User testing done
- [ ] Accessibility testing done

---

## 14. Best Practical Advice

If you want to move fast **right now**, do this exact version:

- build **Home + Events + Locations + Helpdesk + Accessibility**
- use **JSON seed data**
- skip auth
- skip database for now
- add **event recommendations** later
- deploy once the core pages work

That is the cleanest version to start building immediately without drowning in optional nonsense.
