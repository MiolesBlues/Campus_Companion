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
- AI assistant widget
- Event calendar with category colour highlights

### Optional authentication upgrade
If the team wants login support later, add authentication as an optional enhancement instead of part of the minimum build.

Recommended approach:
- use **Supabase Auth** for email/password login
- keep users signed in with Supabase session persistence so they do not need to log in every visit
- store user roles in a separate `profiles` table
- use roles such as:
  - `student`
  - `teacher`
  - `admin`

Why this approach is better:
- safer than building your own password system
- easier to manage sessions
- supports role-based access if needed later
- fits the assignment better than manually storing passwords

Important note:
- authentication is **optional**
- do not let login/auth delay the core app unless the rest of the base features are already stable

### Optional AI assistant widget
If the team wants a more interactive feature, add a small AI-style assistant widget in the bottom-right corner of the screen.

Suggested behaviour:
- floating chat button fixed in the corner of the page
- opens a small tray or chat panel
- answers simple questions about events, locations, helpdesk, and app navigation
- helps first-year students find information quickly

Implementation options:
- **simple version:** predefined FAQ responses for common questions
- **advanced version:** lightweight AI integration for natural-language replies

Why this is a good optional feature:
- makes the app feel more modern and interactive
- improves usability for new students
- gives the team an extra demo feature for the presentation
- can be kept small enough not to distract from the main assignment requirements

Important note:
- this feature should stay **optional**
- build the core app first before adding the assistant widget

### Optional event calendar enhancement
If the team wants a stronger visual planning feature, add a calendar view for campus events.

Suggested behaviour:
- monthly calendar layout
- event dates highlighted with different colours depending on category
- clicking a date can show events scheduled for that day
- helps students plan their week or month more easily

Example category colours:
- `Technology` → blue
- `Careers` → green
- `Sports` → orange
- `Social` → pink
- `Academic` → purple

Why this is a good optional feature:
- improves the events section visually
- makes the app feel more useful for planning
- gives the group a stronger demo feature for the presentation
- can be built using the same fictional event data already used in the app

Important note:
- this feature should remain **optional**
- only add it after the core event list and navigation are stable

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

## Person 2 — Home + Layout + Styling - Vladyslav Vit
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

### Optional location page enhancements
To make the locations page more useful and interactive, the team may also add:
- a **search bar** for building names or services
- a **filter by location type** such as study space, support, or event space
- an **essential or popular locations** section near the top of the page
- **quick info badges** such as wheelchair accessible, quiet study, or student support
- **grouping by category** so locations feel more organised instead of being one long list

Why these are good optional improvements:
- they improve usability for first-year students
- they make the page feel more interactive and less like a plain list
- they are realistic to build without needing a complex backend

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

### Recommended personalised version
Let users have simple interests or preferences, then recommend events that match those interests.

Example:
- a user likes `sports`, `fitness`, and `social events`
- the app should recommend sports-related events first
- a user who prefers `tech` or `careers` should see those events ranked higher

### Simple version
Use fictional user interests and event tags.
Then recommend events based on matching categories or similarity scores.

Example:
- user likes `tech`, `careers`, `free events`
- event has matching tags
- show those events first

### Suggested inputs/features
- user preferred categories
- user interest tags
- optional time preference
- event category
- event tags

### Suggested logic
- count matching tags/categories, or
- use cosine similarity on simple feature vectors, or
- use k-nearest neighbours if the team wants a slightly more ML-style approach

### Suggested UI output
Show recommendations in places like:
- `Recommended for you` on the home page
- `Suggested events based on your interests` on the events page

Important note:
- this is a strong option for the assignment because it is easy to explain, relevant to the app, and suitable for fictional data

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
